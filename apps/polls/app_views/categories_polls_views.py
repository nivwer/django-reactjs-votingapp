# Standard.
from datetime import datetime, timedelta
import json
# Virtualenv.
from dotenv import load_dotenv
# Django.
from django.http import HttpResponse
from django.core.paginator import Paginator
from django.contrib.auth.models import User
# Rest Framework.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import AllowAny
# Async Rest Framework support.
from adrf.decorators import api_view
# MongoDB connection.
from utils.mongo_connection import MongoDBSingleton
# MongoDB.
from pymongo import DESCENDING
from pymongo.errors import PyMongoError
from bson import json_util
# Models and Serializers.
from apps.profiles.models import UserProfile
from apps.profiles.serializers import UserProfileSerializer
# Utils.
from apps.polls.utils.categorys import CATEGORIES


# Load the virtual environment.
load_dotenv()


# Helpers.

# Get collections from a database in MongoDB.
class GetCollectionsMongoDB:
    def __init__(self, database, collections):
        # Get database.
        db = MongoDBSingleton().client[database]
        # Get collections.
        for collection in collections:
            setattr(self, collection, db[collection])


# Views.

# Get poll categories.
@api_view(['GET'])
@permission_classes([AllowAny])
def polls_categories(request):

    # Time To Live.
    TTL = timedelta(weeks=1)
    expiration_date = datetime.utcnow() + TTL

    # Cache Control.
    res = HttpResponse(json.dumps(CATEGORIES), content_type='application/json')
    res['Cache-Control'] = f'max-age={int(TTL.total_seconds())}'
    res['Expires'] = expiration_date.strftime('%a, %d %b %Y %H:%M:%S GMT')

    # Response.
    return res


# Handles the get process for a category polls.
@api_view(['GET'])
@permission_classes([AllowAny])
async def category_polls(request, category):
    # If user is login.
    is_login = True if request.user else False

    try:
        # Get collections from the polls database.
        polls_db = GetCollectionsMongoDB(
            'polls_db', ['polls', 'user_votes'])

        # Find the polls in the polls collection.
        polls_list = await polls_db.polls.find(
            {'category': category},
            sort=[('creation_date', DESCENDING)]
        ).to_list(length=None)

        # Convert the BSON response to a JSON response.
        polls_list_json = json_util._json_convert(polls_list)

        # Filter the polls.
        polls = []
        for poll in polls_list_json:
            # Verify the privacy of polls.
            is_public = poll['privacy'] == 'public'
            is_private = poll['privacy'] == 'private'
            is_owner = poll['created_by']['user_id'] == request.user.id
            # Add if is owner in the poll object.
            poll['is_owner'] = is_owner

            if is_public or (is_private and is_owner):
                # Fix poll data.
                poll['_id'] = poll['_id']['$oid']
                poll['creation_date'] = poll['creation_date']['$date']

                # Get the user data.
                user_data = await User.objects.aget(id=poll['created_by']['user_id'])
                user_profile = await UserProfile.objects.aget(pk=user_data.pk)
                # Initialize a UserProfileSerializer instance.
                profile_data = UserProfileSerializer(
                    instance=user_profile).data
                # Add user data to user profile data.
                profile_data['username'] = user_data.username
                # Add user profile data in the poll object.
                poll['profile'] = profile_data

                # Get user vote.
                vote = ''
                if is_login:
                    is_voter = request.user.id in poll['voters']
                    if is_voter:
                        # Find the vote in the user_votes collection.
                        user_vote = await polls_db.user_votes.find_one(
                            {
                                'user_id': request.user.id,
                                'voted_polls.poll_id': poll['_id']
                            },
                            projection={'voted_polls.$': 1})

                        # If the user has voted a poll.
                        if user_vote:
                            vote = user_vote['voted_polls'][0]['vote']

                # Add the vote in the poll.
                poll['user_vote'] = vote if vote else ''

                polls.append(poll)
            else:
                continue

        # If polls not found.
        if not polls:
            return Response(
                {'message': 'Polls not found.'})

        # In case the frontend has pagination or an integrated infinite scroll.
        if request.GET.get('page'):
            page_number = request.GET.get('page')
            paginator = Paginator(polls, 10)
            page_obj = paginator.get_page(page_number)

            page_values_json = json_util._json_convert(page_obj.object_list)

        # Polls res.
        res = page_values_json if request.GET.get('page') else polls
        res.reverse()

        # Response.
        return Response(
            {'polls':  res},
            status=status.HTTP_200_OK)

    # Handle validation errors.
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    # Handle if the user is not found.
    except User.DoesNotExist:
        return Response(
            {'username': ['User is not found.']},
            status=status.HTTP_404_NOT_FOUND)

    # Handle permission denied.
    except PermissionDenied as e:
        return Response(e.detail, status=status.HTTP_403_FORBIDDEN)

    # Handle MongoDB errors.
    except PyMongoError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Handle other exceptions.
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Handles the get process for categories data.
@api_view(['GET'])
@permission_classes([AllowAny])
async def get_categories_data(request):
    try:
        # Get collections from the polls database.
        polls_db = GetCollectionsMongoDB('polls_db', ['polls'])

        # Get the categories data.
        aggregated_data = await polls_db.polls.aggregate(
            [
                {
                    '$group': {
                        '_id': '$category',
                        'total_polls': {'$sum': 1},
                        'total_votes': {'$sum': '$total_votes'}
                    }
                },
                {
                    '$project': {
                        '_id': 0,
                        'category': '$_id',
                        'total_polls': 1,
                        'total_votes': 1
                    }
                }
            ]
        ).to_list(None)

        # Add category data in data categories.
        data_categories = []
        for category in CATEGORIES['list']:
            in_aggregated_data = False
            for category_data in aggregated_data:
                if category['value'] == category_data['category']:
                    data_categories.append({
                        'text': category['text'],
                        'value': category_data['category'],
                        'total_polls': category_data['total_polls'],
                        'total_votes': category_data['total_votes']
                    })
                    in_aggregated_data = True
            
            if not in_aggregated_data:
                data_categories.append({
                    'text': category['text'],
                    'value': category_data['category'],
                    'total_polls': 0,
                    'total_votes': 0
                })

        # Time To Live.
        TTL = timedelta(days=1)
        expiration_date = datetime.utcnow() + TTL

        # Cache Control.
        res = Response(data_categories, content_type='application/json')
        res['Cache-Control'] = f'max-age={int(TTL.total_seconds())}'
        res['Expires'] = expiration_date.strftime('%a, %d %b %Y %H:%M:%S GMT')

        # Response.
        return res

    # Handle validation errors.
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    # Handle MongoDB errors.
    except PyMongoError as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Handle other exceptions.
    except Exception as e:
        print(str(e))
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

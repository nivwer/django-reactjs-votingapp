# Standard.
from datetime import datetime, timedelta
# Django.
from django.contrib.auth.models import User
from django.db import transaction
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
# Rest Framework.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
# Models and Serializers.
from apps.profiles.models import UserProfile
from .serializers import UserSerializer
from apps.profiles.serializers import UserProfileSerializer


# Views.

# Handle the user registration process.
@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def sign_up(request):
    try:
        # Create the user data object.
        user_object = {
            'username': request.data['username'],
            'password': request.data['password'],
            'last_login': datetime.now(),
        }

        # Initialize a UserSerializer instance with the provided data.
        user_serializer = UserSerializer(data=user_object)
        user_serializer.is_valid(raise_exception=True)
        user_instance = user_serializer.save()

        # Set the password for the user using the provided password.
        user_object = User.objects.get(
            username=user_serializer.data['username'])
        user_object.set_password(user_serializer.data['password'])
        user_object.save()

        # Remove the 'password' field to the response.
        user_data = user_serializer.data
        user_data.pop('password')

        # Create a object to ProfileSerializer.
        profile_object = {
            'user': user_instance.pk,
            'profile_name': request.data['username']
        }
        # Initialize a ProfileSerializer instance.
        profile_serializer = UserProfileSerializer(data=profile_object)
        # Throws ValidationError if not valid.
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()
        profile_data = profile_serializer.data

        # Authentication.
        user = authenticate(
            request, username=request.data['username'], password=request.data['password'])

        if user is not None:
            # Login.
            login(request, user)

            # Create a new Token instance associated with the user.
            token = Token.objects.create(user=user_object)

            # Create or update the session in the cookie.
            session_key = request.session.session_key
            if not session_key:
                request.session.save()
                session_key = request.session.session_key

            # Associate the session with the cookie.
            response = JsonResponse(
                {
                    'token': token.key,
                    'user': user_data,
                    'profile': profile_data,
                },
                status=status.HTTP_200_OK,
            )

            response.set_cookie(
                key='session',
                value=session_key,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=30*24*60*60  # d*h*m*seconds
            )

            # Response.
            return response

        # Handle failed authentication.
        raise AuthenticationFailed(
            {'password': ['Failed authentication.']})

    # Handle validation errors.
    except ValidationError as e:
        print(e.detail)
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    # Handle other exceptions.
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Handles the user login process.
@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    try:
        # Authentication.
        user = authenticate(
            request, username=request.data['username'], password=request.data['password'])

        if user is not None:
            # Login.
            login(request, user)

            # Get token associated with the user, or create a new token.
            token, created = Token.objects.get_or_create(user=user)

            # Get user data.
            user_serializer = UserSerializer(instance=user)
            user_data = user_serializer.data
            user_data.pop('password')

            # Get user profile data.
            user_profile = UserProfile.objects.get(user=user)
            profile_data = UserProfileSerializer(instance=user_profile).data

            # Create or update the session in the cookie.
            session_key = request.session.session_key
            if not session_key:
                request.session.save()
                session_key = request.session.session_key

            # Associate the session with the cookie
            response = JsonResponse(
                {
                    'token': token.key,
                    'user': user_data,
                    'profile': profile_data,
                },
                status=status.HTTP_200_OK,
            )

            response.set_cookie(
                key='session',
                value=session_key,
                httponly=True,
                secure=False,
                samesite='Lax',
                max_age=30*24*60*60  # d*h*m*seconds
            )

            # Response.
            return response

        # Handle failed authentication.
        raise AuthenticationFailed(
            {'password': ['Invalid username or password.']})

    # Handle validation errors.
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    # Handle Authentication errors.
    except AuthenticationFailed as e:
        return Response(e.detail, status=status.HTTP_401_UNAUTHORIZED)

    # Handle other exceptions.
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Handle the user logout process.
@api_view(['POST'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def sign_out(request):
    try:
        # Logout.
        logout(request)

        # Response.
        return Response(
            {'message': 'Logout..'},
            status=status.HTTP_200_OK)

    except Exception as e:
        return JsonResponse(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Handles the session if the user is authenticated.
@api_view(['GET'])
@authentication_classes([SessionAuthentication])
@permission_classes([IsAuthenticated])
def check_session(request):
    try:
        # The user is authenticated due to the 'IsAuthenticated' decorator.
        user = request.user

        # Get token associated with the user, or create a new token.
        token, created = Token.objects.get_or_create(user=user)

        # Get user data.
        user_serializer = UserSerializer(instance=user)
        user_data = user_serializer.data
        user_data.pop('password')

        # Get user profile data.
        user_profile = UserProfile.objects.get(user=user)
        profile_data = UserProfileSerializer(instance=user_profile).data

        # Response.
        session_data = {
            'token': token.key,
            'user': user_data,
            'profile': profile_data,
        }

        # Time To Live.
        TTL = timedelta(hours=3)
        expiration_date = datetime.utcnow() + TTL

        # Cache Control.
        res = Response(session_data,
                       content_type='application/json',
                       status=status.HTTP_200_OK)
        res['Cache-Control'] = f'max-age={int(TTL.total_seconds())}'
        res['Expires'] = expiration_date.strftime('%a, %d %b %Y %H:%M:%S GMT')

        # Response.
        return res

    except Exception as e:
        return JsonResponse(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

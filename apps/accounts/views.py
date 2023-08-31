# Standard.
from datetime import datetime
# Django.
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db import transaction
# Rest Framework.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.authtoken.models import Token
# Models and Serializers.
from .serializers import UserSerializer


# Views.

# Handles the registration process for new users.
@api_view(['POST'])
@transaction.atomic
def signup(request):
    try:
        # Config the data.
        data = {
            "username": request.data["username"],
            "password": request.data["password"],
            "first_name": request.data["username"],
            "last_login": datetime.now(),
        }

        # Initialize a UserSerializer instance with the provided data.
        serializer = UserSerializer(data=data)
        # Throws ValidationError if not valid.
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Set the password for the user using the provided password.
        user = User.objects.get(username=serializer.data['username'])
        user.set_password(serializer.data['password'])
        user.save()

        # Create a new Token instance associated with the user.
        token = Token.objects.create(user=user)

        # Remove the 'password' field
        user_data = serializer.data
        user_data.pop('password')

        # Response if successful signup.
        return Response({'token': token.key, 'user': user_data}, status=status.HTTP_201_CREATED)

    # Handle validation errors.
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    # Handle other exceptions.
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Handles the user authentication process.
@api_view(['POST'])
@transaction.atomic
def signin(request):
    try:
        # If not exist the user return a 404 NOT FOUND response.
        user = User.objects.get(username=request.data['username'])

        # Check if the password matches the user's stored password.
        if not user.check_password(request.data['password']):
            # If the password does not match return the 401 response.
            raise AuthenticationFailed({'password': ['Invalid password.']})

        # Get token associated with the user, or create a new token.
        token, created = Token.objects.get_or_create(user=user)

        # Response if successful signin.
        serializer = UserSerializer(instance=user)
        # Remove the 'password' field
        user_data = serializer.data
        user_data.pop('password')

        return Response({'token': token.key, 'user': user_data})

    # Handle validation errors.
    except ValidationError as e:
        return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)

    # Handle Authentication errors.
    except AuthenticationFailed as e:
        return Response(e.detail, status=status.HTTP_401_UNAUTHORIZED)

    # Handle if the user is not found.
    except User.DoesNotExist:
        return Response({'username': ['User is not found.']}, status=status.HTTP_404_NOT_FOUND)

    # Handle other exceptions.
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
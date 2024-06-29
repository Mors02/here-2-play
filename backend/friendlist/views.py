from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from .serializer import UserReportSerializer, GameReportSerializer, FriendRequestSerializer, FriendRequestListSerializer, FriendshipSerializer, FriendshipListSerializer, ChatSerializer, MessageSerializer
from authentication.models import User, UserProfile
from games.models import Game
from .models import FriendRequest, Friendship, Chat, Message
from django.utils import timezone
from django.db.models import Q
import uuid 

class UserReportsView(viewsets.ModelViewSet):

    def get_permissions(self):
        if (self.action in ['create']):
            permission_classes = [IsAuthenticated]
        elif (self.action in ['list', 'retrieve']):
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        data = request.data
        user = request.user
        user_reported = User.objects.get(username=data["userReported"]["username"])
        profile = UserProfile.objects.get(id=user_reported.pk)
        #if its not a friend or a developer
        try:
            user_friends = Friendship.objects.filter(userA_id=user.pk, userB_id=user_reported.pk)
        except Friendship.DoesNotExist:
            if profile.role == 0:
                #you cant report them
                return Response("ERR_NOT_REPORTABLE", status=status.HTTP_400_BAD_REQUEST)


        clean_data = {"user": user.pk, 
                      "user_reported": user_reported.pk, 
                      "cause": data["selected"],
                      "report_date": timezone.now()}
        serializer = UserReportSerializer(data=clean_data)

        if (serializer.is_valid(raise_exception=True)):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response("ERR_SERVER_ERROR", status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        pass

    def list(self, request, pk=None):
        pass


class GameReportsView(viewsets.ModelViewSet):
    def get_permissions(self):
        if (self.action in ['create']):
            permission_classes = [IsAuthenticated]
        elif (self.action in ['list', 'retrieve']):
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        data = request.data
        user = request.user
        game_reported = Game.objects.get(id=data["gameReported"]["id"])
        if game_reported is None:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
        clean_data = {"user": user.pk, 
                      "game_reported": game_reported.pk, 
                      "cause": data["selected"],
                      "report_date": timezone.now()}
        serializer = GameReportSerializer(data=clean_data)
        if (serializer.is_valid(raise_exception=True)):
            serializer.create(clean_data=clean_data)
            #serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response("ERR_SERVER_ERROR", status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, pk=None):
        pass

    def list(self, request, pk=None):
        pass

class ChatViewSet(viewsets.ModelViewSet):
    def get_permission(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def retrieve(self, request, pk=None):
        # print(request)
        userA = request.user.id
        userB = pk
        try:
            request = FriendRequest.objects.get((Q(user_requested_id=userA) & Q(user_requester_id=userB)) | (Q(user_requested_id=userB) & Q(user_requester_id=userA)))
            chat = Chat.objects.get(friend_request_id=request.pk)
            chat = ChatSerializer(chat).data
            return Response(chat, status=status.HTTP_200_OK)
        except FriendRequest.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)

class FriendRequestView(viewsets.ModelViewSet):
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request):
        try:
            #check if user exists
            friend = User.objects.get(username=request.data["username"])
            if (friend.pk == request.user.pk):
                return Response("ERR_SELF_FRIEND", status=status.HTTP_400_BAD_REQUEST)

            clean_data = {"user_requester": request.user.pk, "user_requested": friend.pk, "date": timezone.now()}
            serializer = FriendRequestSerializer(data=clean_data, context={"message": ""})
            if (serializer.is_valid(raise_exception=True)):
                serializer.create(clean_data=clean_data)
                print(serializer.context["message"])
                if (serializer.context["message"] != ""):
                    return Response("ERR_ALREADY_REQUESTED", status=status.HTTP_409_CONFLICT)
                print(serializer.data)
                return Response(status=status.HTTP_200_OK)

            return Response("ERR_SERVER_ERROR", status=status.HTTP_400_BAD_REQUEST)  
        except User.DoesNotExist:
            return Response("ERR_USER_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)


    def list(self, request):
        user = request.user.pk
        serializer = FriendRequestListSerializer(data={"user": user})
        if (serializer.is_valid(raise_exception=True)):
            serializer.list(user=user)
            requests = serializer.context["requests"]
        return Response(requests, status=status.HTTP_200_OK)

    def partial_update(self, request, pk=None):
        data = request.data
        try:
            friendRequest = FriendRequest.objects.get(id=pk)

            if (data["status"] == "den"):
                friendRequest.status = FriendRequest.DENIED
                friendRequest.save()
                return Response(status=status.HTTP_200_OK)
            
            elif (data["status"] == "acc"):
                friendRequest.status = FriendRequest.ACCEPTED
                friendData = {"userA": friendRequest.user_requested, "userB": friendRequest.user_requester}
                
                #create the friendship
                serializer = FriendshipSerializer(data=friendData)
                friendRequest.save()
                if (serializer.is_valid(raise_exception=True)):
                    serializer.create(data=friendData)
                
                #create the chat
                chatData = {"name": uuid.uuid4().hex[:6].lower(), "friend_request": friendRequest}
                print(chatData)
                serializer = ChatSerializer(data={**chatData, 'friend_request': friendRequest.pk})
                if (serializer.is_valid(raise_exception=True)):
                    print("entered")
                    serializer.create(data=chatData)
                    return Response(status=status.HTTP_201_CREATED)
                
            return Response("ERR_SERVER_ERROR",status=status.HTTP_400_BAD_REQUEST)
        except FriendRequest.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status=status.HTTP_404_NOT_FOUND)
        
class FriendshipView(viewsets.ModelViewSet):
    def get_permissions(self):
        permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def destroy(self, request, pk=None):
        try:
            #check if the user exists
            friend = User.objects.get(id=pk)
            #check if they are friends
            friendship = Friendship.objects.get(userA_id=request.user.pk, userB_id=pk)
            friendData = {"userA": pk, "userB": request.user.pk}
            serializer = FriendshipSerializer(data=friendData)
            if (serializer.is_valid(raise_exception=True)):
                serializer.destroy(friendData)
                return Response(status=status.HTTP_200_OK)
            return Response("ERR_SERVER_ERROR", status=status.HTTP_400_BAD_REQUEST)
        except Friendship.DoesNotExist:
            return Response("ERR_RESOURCE_NOT_FOUND", status.HTTP_404_NOT_FOUND)
        except User.DoesNotExist:
            return Response("ERR_USER_NOT_FOUND", status.HTTP_404_NOT_FOUND)


    def list(self, request):
        user = request.user.pk
        serializer = FriendshipListSerializer(data={"user": user})
        if (serializer.is_valid(raise_exception=True)):
            serializer.list(user=user)
            requests = serializer.context["requests"]
        return Response(requests, status=status.HTTP_200_OK)
        
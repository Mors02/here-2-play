from rest_framework import serializers
from .models import UserReport, GameReport, FriendRequest, Friendship, Chat, Message
from django.db.models import Q
from authentication.models import User, UserProfile
from authentication.serializers import UserInfoSerializer

class UserReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReport
        fields = ["id", "user", "user_reported", "report_date", "cause"]

class GameReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameReport
        fields = ["id", "user", "game_reported", "report_date", "cause"]

    def create(self, clean_data):
        report = GameReport(
                user_id=clean_data["user"], 
                game_reported_id=clean_data["game_reported"],
                report_date=clean_data["report_date"],
                cause=clean_data["cause"]
            )
        report.save()
        return report
    
class MessageSerializer(serializers.ModelSerializer):
    user = UserInfoSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'#['chat', 'id', 'sent_at', 'text', 'user']

    def create(self, data):
        message = Message(**data)
        message.save()
        return message

class ChatSerializer(serializers.ModelSerializer):
    messages = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = ['friend_request', 'messages', 'name']

    def create(self, data):
        chat = Chat(**data)
        chat.save()
        return chat
    
    def get_messages(self, obj):
        #MessageSerializer(source='message_chat', many=True, read_only=True)
        messages = obj.message_chat.order_by("-sent_at")
        return MessageSerializer(messages, many=True).data


class FriendRequestSerializer(serializers.ModelSerializer):
    chat = ChatSerializer(source="chat_friend_request", read_only=True)

    class Meta:
        model = FriendRequest
        fields = '__all__'

    def create(self, clean_data):
        requester = clean_data["user_requester"]
        requested = clean_data["user_requested"]
        try:
            #if a request already exists that is not denied, you cant create another
            request = FriendRequest.objects.get(
                ((Q(user_requested_id=requested) & Q(user_requester_id=requester)) 
                | (Q(user_requested_id=requester) & Q(user_requester_id=requested))) 
                & ~Q(status=FriendRequest.DENIED))
            #request = FriendRequest.objects.get(Q(user_requested_id=requester) & Q(user_requester_id=requested) & ~Q(status=FriendRequest.DENIED))
            self.context["message"] = "ERROR"
        #    return None
        except FriendRequest.DoesNotExist:
            print("DOES NOT EXIST")
            request = FriendRequest(
                user_requester_id = requester,
                user_requested_id = requested,
                date = clean_data["date"]
            )
            request.save()
            return request
        except FriendRequest.MultipleObjectsReturned:
            self.context["message"] = "ERROR"
            return None

class FriendRequestListSerializer(serializers.Serializer):
    user = serializers.IntegerField()

    def list(self, user):
        
        requestsObj = FriendRequest.objects.filter(user_requested_id=user, status=FriendRequest.PENDING)
        
        requestJson = [
            {
                "id": req.id,
                "username": User.objects.get(id=req.user_requester.pk).username,
                "user_id": req.user_requester.pk,
                "profile_picture": UserProfile.objects.get(user_id=req.user_requester.pk).profile_picture.url
            }
            for req in requestsObj
        ]

        self.context["requests"] = requestJson
        return user

class FriendshipSerializer(serializers.Serializer):
    class Meta:
        model = FriendRequest
        fields = '__all__'

    def create(self, data):
        #create double friendship
        friendship1 = Friendship(userA = data["userA"], userB = data["userB"])
        friendship2 = Friendship(userB = data["userA"], userA = data["userB"])
        friendship1.save()
        friendship2.save()
        return friendship1

    def destroy(self, data):
        Friendship.objects.get(userA = data["userA"], userB = data["userB"]).delete()
        Friendship.objects.get(userB = data["userA"], userA = data["userB"]).delete()
        FriendRequest.objects.get(((Q(user_requested_id=data["userA"]) & Q(user_requester_id=data["userB"])) 
                | (Q(user_requested_id=data["userB"]) & Q(user_requester_id=data["userA"]))) 
                & Q(status=FriendRequest.ACCEPTED)).delete()
        
        return None

class FriendshipListSerializer(serializers.Serializer):
    user = serializers.IntegerField()

    def list(self, user):
        
        requestsObj = Friendship.objects.filter(userA_id=user)
        
        requestJson = [
            {
                "id": req.userB.pk,
                "username": User.objects.get(id=req.userB.pk).username,
                "profile_picture": UserProfile.objects.get(user_id=req.userB.pk).profile_picture.url
            }
            for req in requestsObj
        ]

        self.context["requests"] = requestJson
        return user
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from friendlist.models import Chat, Message
from friendlist.serializer import MessageSerializer
from channels.db import database_sync_to_async
from authentication.serializers import UserInfoSerializer

class WSConsumerChat(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if (not user.is_authenticated):
            await self.close()
            return
        
        self.room_name = self.scope['url_route']['kwargs']['room']
        #print(self.room_name)
        
        if (not await self.chat_exists(self.room_name)):
            await self.close()
            return

        self.room_group_name = 'chat_' + self.room_name
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        #print(self.scope)
        print("CONNESSO AL SERVER")
        await self.accept()

    @database_sync_to_async
    def chat_exists(self, room_name):
        return Chat.objects.filter(name=room_name).exists()
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        
        msg = await self.save_to_db(data['data']['msg'])
        print(msg)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chatroom_message',
                'msg': msg,
            }
        )

    async def chatroom_message(self, event):
        await self.send(text_data=json.dumps(event['msg']))

    @database_sync_to_async
    def save_to_db(self, msg):
        chat = Chat.objects.get(name=self.room_name)
        data = {"chat": chat.pk, "user": self.scope["user"].pk, "text": msg}
        
        clean_data = {**data, "user": self.scope["user"], "chat": chat}
        message = Message(**clean_data)
        message.save()
        msg = MessageSerializer(message).data
        return msg

import base64
from django.test import TestCase
from django.contrib.auth import get_user_model
from authentication.models import UserProfile, Role
from authentication.serializers import UserEditSerializer, UserInfoSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
User = get_user_model()

class UserEditTestCase(TestCase):
    def setUp(self):
        role = Role.objects.create(name="Developer", slug='developer')
        #user che verrà modificato
        user = User.objects.create(username="Test", email="test@email.it", password="test123.")
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

        #user secondario per i controlli
        user = User.objects.create(username="Modificato", email="modificato@email.it", password="test123.")
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

    def test_edit_user(self):
        user = User.objects.get(id=1)
        content = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAUA" + "AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO" + "9TXL0Y4OHwAAAABJRU5ErkJggg==")
        image = SimpleUploadedFile("file.jpeg", content, content_type="image/jpeg")
        
        base_data={"username": "Nuovo", "first_name": "Test", "last_name": "Prova", "email": "correct@email.it", "profile_picture": image}
        #print(base_data)
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=base_data,
                                        context=context)
        print(serializer)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, base_data)
            self.assertEqual(serializer.context["message"], "")

        content = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAUA" + "AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO" + "9TXL0Y4OHwAAAABJRU5ErkJggg==")
        image = SimpleUploadedFile("file.jpeg", content, content_type="image/jpeg")

        data_existing_email={**base_data, "email": "modificato@email.it"}
        #print(data_existing_email)
        serializer = UserEditSerializer(data=data_existing_email,
                                        context=context)
        print(serializer)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_existing_email)
            self.assertEqual(serializer.context["message"], "ERR_ALREADY_REGISTERED")

    

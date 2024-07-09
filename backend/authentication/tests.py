import base64
from django.test import TestCase
from django.contrib.auth import get_user_model, authenticate
from authentication.models import UserProfile, Role
from authentication.serializers import UserEditSerializer, UserInfoSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError, ErrorDetail
User = get_user_model()

class UserEditTestCase(TestCase):
    def setUp(self):
        self.base_data = {
            "username": "Nuovo", 
            "first_name": "Test", 
            "last_name": "Prova", 
            "email": "correct@email.it"
        }

        role = Role.objects.create(name="Developer", slug='developer')
        # User che verrà modificato
        user = User.objects.create(username="Test", email="test@email.it")
        user.set_password("test123.")
        user.save()
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

        # User secondario per i controlli
        user = User.objects.create(username="Modificato", email="modificato@email.it", password="test123.")
        user.set_password("test123.")
        user.save()
        UserProfile.objects.create(user=user, role_id=1, profile_picture='profile_pictures/default.jpeg')

    def test_edit_user(self):
        user = User.objects.get(id=1)

        # Controlliamo con valori corretti
        context = {
            "user": user, 
            "message": "", 
            "changedPassword": False
        }
        serializer = UserEditSerializer(data=self.base_data, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, self.base_data)
            self.assertEqual(serializer.context["message"], "")
        # Riprendiamo lo user dopo le modifiche
        user = User.objects.get(id=1)

        # Controlliamo con la foto profilo
        content = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAUA" + "AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO" + "9TXL0Y4OHwAAAABJRU5ErkJggg==")
        image = SimpleUploadedFile("file.jpeg", content, content_type="image/jpeg")
        data_with_pfp = {**self.base_data, "profile_picture": image}
        context = {"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_with_pfp, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_with_pfp)
            self.assertEqual(serializer.context["message"], "") 
        
    # Controlliamo con email già registrata
    def test_existing_email(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_existing_email = {**self.base_data, "email": "modificato@email.it"}
        serializer = UserEditSerializer(data=data_existing_email, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_existing_email)
            self.assertEqual(serializer.context["message"], "ERR_ALREADY_REGISTERED")

    # Controlliamo con username già registrato
    def test_existing_username(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_existing_username = {**self.base_data, "username": "Modificato"}
        serializer = UserEditSerializer(data=data_existing_username, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_existing_username)
            self.assertEqual(serializer.context["message"], "ERR_ALREADY_REGISTERED")
    
    # Controlliamo con email non validata
    def test_invalid_email(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_invalid_email = {**self.base_data, "email": "test.prova"}
        serializer = UserEditSerializer(data=data_invalid_email, context=context)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as err:
            self.assertEquals(err.get_codes()['email'], ['invalid'])

    # Controlliamo con email vuota
    def test_blank_email(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_blank_email = {**self.base_data, "email": ""}
        serializer = UserEditSerializer(data=data_blank_email, context=context)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as err:
            self.assertEquals(err.get_codes()['email'], ['blank'])

    # Controlliamo con username vuoto
    def test_blank_username(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_blank_username={**self.base_data, "username": ""}
        serializer = UserEditSerializer(data=data_blank_username, context=context)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as err:
            self.assertEquals(err.get_codes()['username'], ['blank'])

    # Controlliamo cambio password con nuova password vuota
    def test_edit_blank_new_password(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}
        
        data_blank_new_password={**self.base_data, "oldPassword": "test123.", "newPassword": "", "confirmNewPassword": ""}
        serializer = UserEditSerializer(data=data_blank_new_password, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_blank_new_password)
            self.assertEqual(serializer.context["message"], "ERR_INSECURE_PASSWORD")

    # Controlliamo cambio password con nuova password errata
    def test_edit_different_new_password(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_different_new_password={**self.base_data, "oldPassword": "test123.", "newPassword": "nuovo123.", "confirmNewPassword": "nuovo312."}
        serializer = UserEditSerializer(data=data_different_new_password, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_different_new_password)
            self.assertEqual(serializer.context["message"], "ERR_DIFFERENT_PASSWORDS")

    # Controlliamo cambio password con vecchia password sbagliata
    def test_bad_old_password(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_bad_old_password={**self.base_data, "oldPassword": "test1", "newPassword": "nuovo123.", "confirmNewPassword": "nuovo123."}
        serializer = UserEditSerializer(data=data_bad_old_password, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_bad_old_password)
            self.assertEqual(serializer.context["message"], "ERR_WRONG_CREDENTIALS")

    # Controlliamo cambio password corretto
    def test_good_new_password(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_good_new_password={**self.base_data, "oldPassword": "test123.", "newPassword": "nuovo123.", "confirmNewPassword": "nuovo123."}
        serializer = UserEditSerializer(data=data_good_new_password, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_good_new_password)
            self.assertEqual(serializer.context["message"], "")
            self.assertEqual(serializer.context["changedPassword"], True)

    # Controlliamo first_name e last_name con tipo errato
    def test_invalid_name(self):
        user = User.objects.get(id=1)
        context = {"user": user, "message": "", "changedPassword": False}

        data_invalid_name = {**self.base_data, "first_name": 44, "last_name": 60}
        serializer = UserEditSerializer(data=data_invalid_name, context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_invalid_name)
            self.assertEqual(serializer.context["message"], 'ERR_INVALID_TYPE')        

        
        

    

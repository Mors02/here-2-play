import base64
from django.test import TestCase
from django.contrib.auth import get_user_model
from authentication.models import UserProfile, Role
from authentication.serializers import UserEditSerializer, UserInfoSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.exceptions import ValidationError, ErrorDetail
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
        
        #controlliamo con valori corretti
        base_data={"username": "Nuovo", "first_name": "Test", "last_name": "Prova", "email": "correct@email.it"}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=base_data,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, base_data)
            self.assertEqual(serializer.context["message"], "")        

        #controlliamo con email già registrata
        data_existing_email={**base_data, "email": "modificato@email.it"}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_existing_email,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_existing_email)
            self.assertEqual(serializer.context["message"], "ERR_ALREADY_REGISTERED")

        #controlliamo con username già registrato
        data_existing_username={**base_data, "username": "Modificato"}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_existing_username,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_existing_username)
            self.assertEqual(serializer.context["message"], "ERR_ALREADY_REGISTERED")
        
        #controlliamo con email non validata
        data_invalid_email={**base_data, "email": "test.prova"}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_invalid_email,
                                        context=context)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as err:
            self.assertEquals(err.get_codes()['email'], ['invalid'])

        #controlliamo con email vuota
        data_blank_email={**base_data, "email": ""}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_blank_email,
                                        context=context)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as err:
            self.assertEquals(err.get_codes()['email'], ['blank'])

        #controlliamo con username vuoto
        data_blank_username={**base_data, "username": ""}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_blank_username,
                                        context=context)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as err:
            self.assertEquals(err.get_codes()['username'], ['blank'])

        #controlliamo cambio password con nuova password vuota
        data_blank_new_password={**base_data, "oldPassword": "test123.", "newPassword": "", "confirmNewPassword": ""}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_blank_new_password,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_blank_new_password)
            self.assertEqual(serializer.context["message"], "ERR_INSECURE_PASSWORD")

        #controlliamo cambio password con nuova password vuota
        data_different_new_password={**base_data, "oldPassword": "test123.", "newPassword": "nuovo123.", "confirmNewPassword": "nuovo312."}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_different_new_password,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_different_new_password)
            self.assertEqual(serializer.context["message"], "ERR_DIFFERENT_PASSWORDS")

        #controlliamo cambio password con vecchia password sbagliata
        data_bad_old_password={**base_data, "oldPassword": "test1", "newPassword": "nuovo123.", "confirmNewPassword": "nuovo123."}
        context={"user": user, "message": "", "changedPassword": False}
        serializer = UserEditSerializer(data=data_bad_old_password,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_bad_old_password)
            self.assertEqual(serializer.context["message"], "ERR_WRONG_CREDENTIALS")

        #controlliamo first_name e last_name con tipo errato
        data_invalid_name={**base_data, "first_name": 44, "last_name": 60}
        context={"user": user, "message": "", "changedPassword": False}
        print(data_invalid_name)
        serializer = UserEditSerializer(data=data_invalid_name,
                                        context=context)
        if (serializer.is_valid(raise_exception=True)):
            serializer.edit(user, data_invalid_name)
            self.assertEqual(serializer.context["message"], 'ERR_INVALID_TYPE')        

        
        

    

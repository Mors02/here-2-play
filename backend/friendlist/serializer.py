from rest_framework import serializers
from .models import UserReport

class UserReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserReport
        fields = ["id", "user", "user_reported", "report_date", "cause"]

    def create(self, clean_data):
        print(clean_data)
        report = UserReport(
                user_id=clean_data["user"], 
                user_reported_id=clean_data["user_reported"],
                report_date=clean_data["report_date"],
                cause=clean_data["cause"]
            )
        print(report)
        return report
# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ["username", "email", "password", "confirm_password", "role"]
        extra_kwargs = {
            "username": {"required": True},
            "email": {"required": True},
            "role": {"required": False, "default": "Member"}
        }

    def validate_username(self, value):
        """Check that username is unique and valid"""
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long")
        
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists")
        
        return value

    def validate_email(self, value):
        """Check that email is valid and unique"""
        if not value:
            raise serializers.ValidationError("Email is required")
        
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        return value

    def validate_password(self, value):
        """Validate password strength"""
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        
        # Check for common password patterns
        common_passwords = ['password', '12345678', 'qwerty123', 'admin123']
        if value.lower() in common_passwords:
            raise serializers.ValidationError("Password is too common. Please choose a stronger password")
        
        # Check if password contains at least one number
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one number")
        
        return value

    def validate(self, attrs):
        """Validate that password and confirm_password match"""
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        if password != confirm_password:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        
        return attrs

    def create(self, validated_data):
        """Create and return a new user"""
        try:
            # Remove confirm_password as it's not needed for user creation
            validated_data.pop('confirm_password')
            
            # Get role with default
            role = validated_data.pop('role', 'Member')
            
            # Create user
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=validated_data["password"],
                role=role
            )
            
            return user
            
        except Exception as e:
            raise serializers.ValidationError({
                "error": f"Failed to create user: {str(e)}"
            })


class UserSerializer(serializers.ModelSerializer):
    """Serializer for returning user data"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "full_name", "is_staff", "is_superuser"]
        read_only_fields = ["id", "is_staff", "is_superuser"]
    
    def get_full_name(self, obj):
        """Get user's full name"""
        return obj.get_full_name() or obj.username


# ✅ Simple version if you don't want password confirmation
class SimpleRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},
            "username": {"required": True},
            "email": {"required": True}
        }

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role="Member"
        )
        return user

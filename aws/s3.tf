resource "aws_s3_bucket" "stories-like-grapes-s3" {
  bucket        = "stories-like-grapes"
  force_destroy = false

  tags = {
    Name = "Stories like grapes bucket"
    Environment = "prod"
  }
}

resource "aws_s3_bucket_public_access_block" "stories-like-grapes-access-block" {
  bucket = aws_s3_bucket.stories-like-grapes-s3.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_iam_user" "s3_presigned_url_user" {
  name = "s3-presigned-url-user"
}

resource "aws_iam_policy" "s3_presigned_url_policy" {
  name        = "S3PresignedUrlPolicy"
  description = "Policy for allowing S3 access for presigned URL generation"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowListBucket",
        Effect    = "Allow",
        Action    = "s3:ListBucket",
        Resource  = "arn:aws:s3:::stories-like-grapes"
      },
      {
        Sid       = "AllowS3ObjectAccess",
        Effect    = "Allow",
        Action    = [
          "s3:GetObject",
          "s3:PutObject",
        ],
        Resource = "arn:aws:s3:::stories-like-grapes/*" # Replace with your bucket name
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "s3_presigned_url_user_attachment" {
  user       = aws_iam_user.s3_presigned_url_user.name
  policy_arn = aws_iam_policy.s3_presigned_url_policy.arn
}

resource "aws_iam_access_key" "s3_presigned_url_user_key" {
  user = aws_iam_user.s3_presigned_url_user.name
}

output "s3_presigned_url_access_key_id" {
  value       = aws_iam_access_key.s3_presigned_url_user_key.id
  description = "Access Key ID for S3 Presigned URL user"
  sensitive   = true
}

output "s3_presigned_url_secret_access_key" {
  value       = aws_iam_access_key.s3_presigned_url_user_key.secret
  description = "Secret Access Key for S3 Presigned URL user"
  sensitive   = true
}

# Dev Bucket
resource "aws_s3_bucket" "stories_like_grapes_dev" {
  bucket        = "stories-like-grapes-dev"
  force_destroy = true # Optional: allows cleanup of dev bucket during destroy

  tags = {
    Name        = "Stories like grapes dev bucket"
    Environment = "dev"
  }
}

resource "aws_s3_bucket_public_access_block" "stories_like_grapes_dev_access_block" {
  bucket = aws_s3_bucket.stories_like_grapes_dev.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# IAM Policy for Dev Bucket
resource "aws_iam_policy" "s3_presigned_url_dev_policy" {
  name        = "S3PresignedUrlDevPolicy"
  description = "Policy for allowing S3 access for presigned URL generation in dev"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowListDevBucket",
        Effect    = "Allow",
        Action    = "s3:ListBucket",
        Resource  = "arn:aws:s3:::stories-like-grapes-dev"
      },
      {
        Sid       = "AllowDevS3ObjectAccess",
        Effect    = "Allow",
        Action    = [
          "s3:GetObject",
          "s3:PutObject",
        ],
        Resource = "arn:aws:s3:::stories-like-grapes-dev/*"
      }
    ]
  })
}

# IAM User for Dev Bucket
resource "aws_iam_user" "s3_presigned_url_dev_user" {
  name = "s3-presigned-url-dev-user"
}

resource "aws_iam_user_policy_attachment" "s3_presigned_url_dev_user_attachment" {
  user       = aws_iam_user.s3_presigned_url_dev_user.name
  policy_arn = aws_iam_policy.s3_presigned_url_dev_policy.arn
}

resource "aws_iam_access_key" "s3_presigned_url_dev_user_key" {
  user = aws_iam_user.s3_presigned_url_dev_user.name
}

# Outputs for Dev Credentials
output "s3_presigned_url_dev_access_key_id" {
  value       = aws_iam_access_key.s3_presigned_url_dev_user_key.id
  description = "Access Key ID for S3 Presigned URL dev user"
  sensitive   = true
}

output "s3_presigned_url_dev_secret_access_key" {
  value       = aws_iam_access_key.s3_presigned_url_dev_user_key.secret
  description = "Secret Access Key for S3 Presigned URL dev user"
  sensitive   = true
}
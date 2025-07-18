provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "climate_data" {
  bucket = "climate-nexus-data"
  acl    = "private"
}
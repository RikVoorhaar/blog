#!/bin/bash

# Check if an argument is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <image-file>"
    exit 1
fi

# Input image file
input_image=$1

# Extracting the base name without the extension
base_name=$(basename "$input_image" | cut -f 1 -d '.')

# Directory for converted images
output_dir="${base_name}-converted"
rm -rf "$output_dir"
mkdir -p "$output_dir"

# Function to convert images
convert_image() {
    size=$1
    format=$2
    quality=$3

    output_file="${output_dir}/${base_name}-${size}.${format}"

    convert "$input_image" -resize ${size}x${size} -quality "$quality" "$output_file"
}

# Converting to different sizes and formats
for size in 512 1024 2048; do
    convert_image $size "jpg" 60   # Quality is not used for jpg in this script
    convert_image $size "webp" 65
    convert_image $size "avif" 50
done

echo "Conversion complete. Files saved in ${output_dir}/"

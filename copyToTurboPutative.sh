#!/bin/bash

# Source and destination folder paths
source_folder="/home/$USER/projects/TurboOmics/out"
destination_folder="/home/$USER/projects/TurboPutative-web/src/TurboOmicsIntegrator/App"

# New name for the file
old_name="index.html"
new_name="TurboOmicsApp.html"

# Check if the source folder exists
if [ ! -d "$source_folder" ]; then
    echo "Source folder does not exist."
    exit 1
fi

# Check if the destination folder exists, if not, create it
if [ ! -d "$destination_folder" ]; then
    mkdir -p "$destination_folder"
fi

# Copy the contents from the source folder to the destination folder
cp -r "$source_folder"/* "$destination_folder"

# Change the name of a file in the destination folder
if [ -e "$destination_folder/$old_name" ]; then
    mv "$destination_folder/$old_name" "$destination_folder/$new_name"
fi

echo "Copy and name change completed."

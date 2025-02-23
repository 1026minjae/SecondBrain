import os
import json

def generate_index(directory="notes", output_file="notes/index.json"):
    try:
        # List all Markdown files in the directory
        markdown_files = [f for f in os.listdir(directory) if f.endswith(".md")]

        # Write the list to a JSON file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(markdown_files, f, indent=2)

        print(f"✅ index.json updated successfully: {output_file}")

    except Exception as e:
        print(f"❌ Error: {e}")

# Run the function
generate_index()

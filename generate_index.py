import os
import json
import re

''' 
This part specifies the regular expressions for each type of links 

The following types can be detected:
    1. Wiki Link:       [[Target File Name]]
    2. Markdown Link:   [Shown Text](Target File Name) 
   
And currently, target file should be in same directory which the link-owning file locates.
'''
def get_links_in_md_file (filename):
    wiki_link_pattern = r"\[\[([^|^\]]+)[|]?[^\]]*\]\]"
    md_link_pattern = r"\[.*?\]\((.*?)\)"

    links = []
    parentDir = filename[:(filename.rindex('/')+1)]
    formatFunc = lambda target: "{}{}.md".format(parentDir, target)

    with open (filename, "r", encoding="utf-8") as f:
        for line in f:
            links.extend (list(map(formatFunc, re.findall(wiki_link_pattern, line))))
            links.extend (list(map(formatFunc, re.findall(md_link_pattern, line))))

    return links

def get_md_file_list_from (directory):
    filename_link_pair_list = []

    for f in os.listdir (directory):
        if f.endswith (".md"):
            filename = (directory + "/" + f)
            filename_link_pair_list.append ({
                                "filename": filename, 
                                "links":    get_links_in_md_file (filename)
                             })
        elif os.path.isdir (directory + "/" + f):
            filename_link_pair_list.extend (get_md_file_list_from (directory + "/" + f))
    
    return filename_link_pair_list

def generate_json (directory="notes", output_file="notes/index.json"):
    try:
        # List all Markdown files in the directory
        markdown_files = get_md_file_list_from (directory)

        # Write the list to a JSON file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(markdown_files, f, indent=2)

        print(f"✅ index.json updated successfully: {output_file}")

    except Exception as e:
        print(f"❌ Error: {e}")

# Run the function
generate_json ()

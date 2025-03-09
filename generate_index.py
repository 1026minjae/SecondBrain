import json
import os
import re

# global variables
'''
Name of directory containing all files
'''
rootdir = "notes"

'''
Name of output file (JSON format)
'''
output_file="notes/index.json"

'''
This dictionary contains the map of all markdown files in 'notes' directory.
Each key is the filename of markdown files (Multiple files can have same name)
For each key, the set of file paths (beginning from 'notes' directory) exists.
'''
md_filename_map = {}

def generate_json ():
    global rootdir
    global output_file

    try:
        # Make the filename-filepath map of all markdown files in `rootdir`
        generate_md_filename_map_from (rootdir)

        # Make the list of md file objects based on the filename-filepath map above.
        md_object_list = generate_md_object_list ()

        # Write the list to a JSON file
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(md_object_list, f, indent=2)

        print(f"✅ index.json updated successfully: {output_file}")

    except Exception as e:
        print(f"❌ Error: {e}")

'''
This function makes the list of all markdown files in given directory.
Result is stored in into global variable `md_filename_map`
'''
def generate_md_filename_map_from (directory):
    global md_filename_map

    for filename in os.listdir (directory):
        filepath = (directory + "/" + filename)

        if filename.endswith (".md"):
            filename = filename[:-3]
            if (filename in md_filename_map):
                md_filename_map[filename].add(filepath)
            else:
                md_filename_map[filename] = {filepath}
        elif os.path.isdir (filepath):
            generate_md_filename_map_from (filepath)

'''
This function generates and returns the list of md file objects.
Md file object has three elements; name, links_to_exist, links_to_nonexist.
1. `name` is filepath of md file.
2. `links_to_exist` is the list of links towards a md file which exists in `md_filename_map`.
3. `links_to_nonexist` is the list of links towards a md file which does not exist in `md_filename_map`.
'''
def generate_md_object_list ():
    global md_filename_map

    md_object_list = []

    for filename in md_filename_map:
        for filepath in md_filename_map[filename]:
            links_to_exist, links_to_nonexist = get_links_in_md_file (filepath)
            md_object_list.append ({
                                        "name": filepath, 
                                        "links_to_exist": links_to_exist, 
                                        "links_to_nonexist": links_to_nonexist
                                })
    return md_object_list

''' 
This part specifies the regular expressions for each type of links 

The following types can be detected:
    1. Wiki Link:       [[Target File Name]]
    2. Markdown Link:   [Shown Text](Target File Name) 
   
And currently, target file should be in same directory which the link-owning file locates.
'''
def get_links_in_md_file (filename):
    link_patterns = [
                        r"\[\[([^|^\]]+)[|]?[^\]]*\]\]",    # wiki link
                        r"\[.*?\]\((.*?)\)"                 # md link
                    ]

    links_to_exist = []
    links_to_nonexist = []

    with open (filename, "r", encoding="utf-8") as f:
        for line in f:
            for pattern in link_patterns:
                for target in re.findall(pattern, line):
                    is_exist, filepath = get_target_md_file (target)
                    if is_exist:
                        links_to_exist.append(filepath)
                    else:
                        links_to_nonexist.append(filepath)

    return (links_to_exist, links_to_nonexist)

'''
This function checks if `target` exists in `md_filename_map`.
If exist, returns (True, filepath of target),
else, returns (False, filename of target + label)
'''
def get_target_md_file (target):
    global rootdir

    filename = target[target.rfind('/')+1:]
    filepath = "{}/{}.md".format(rootdir, target)

    if (filename in md_filename_map):
        if (filepath in md_filename_map[filename]):
            return (True, filepath)
        elif (len(md_filename_map[filename]) == 1):
            return (True, list(md_filename_map[filename])[0])
        else:
            return (False, "{} (Non-exist)".format(target))
    else:
        return (False, "{} (Non-exist)".format(target))

# Run the function
if __name__ == "__main__": 
    generate_json ()

import os

EXCLUDE_DIRS = {"node_modules", ".git", "__pycache__", "venv"}

def tree(dir_path, file, prefix=""):
    files = os.listdir(dir_path)
    files = [f for f in files if f not in EXCLUDE_DIRS]

    for i, name in enumerate(files):
        path = os.path.join(dir_path, name)
        connector = "└── " if i == len(files) - 1 else "├── "
        file.write(prefix + connector + name + "\n")

        if os.path.isdir(path):
            extension = "    " if i == len(files) - 1 else "│   "
            tree(path, file, prefix + extension)

with open("project_tree.txt", "w", encoding="utf-8") as f:
    tree(".", f)

print("✅ Tree saved to project_tree.txt")
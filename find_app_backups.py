import os
import json

base_dir = r"C:\Users\USER\.gemini\antigravity-ide\brain"
output_dir = r"c:\Projects\Projects\留學機票與學生簽證服務系統\app_tsx_backups"
os.makedirs(output_dir, exist_ok=True)

idx = 0
for d in os.listdir(base_dir):
    p = os.path.join(base_dir, d, ".system_generated", "logs", "transcript.jsonl")
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            for line in f:
                if "App.tsx" in line and ("write_to_file" in line or "replace_file_content" in line or "multi_replace_file_content" in line):
                    try:
                        obj = json.loads(line)
                        if "tool_calls" in obj:
                            for tc in obj["tool_calls"]:
                                if "args" in tc:
                                    args = tc["args"]
                                    if isinstance(args, str):
                                        try:
                                            args = json.loads(args)
                                        except:
                                            pass
                                    if isinstance(args, dict) and "TargetFile" in args and args["TargetFile"].endswith("App.tsx"):
                                        
                                        if "TargetContent" in args:
                                            if len(args["TargetContent"]) > 10000:
                                                with open(os.path.join(output_dir, f"{d}_tc_{idx}.tsx"), "w", encoding="utf-8") as out:
                                                    out.write(args["TargetContent"])
                                                idx += 1
                                        
                                        rc = args.get("ReplacementChunks")
                                        if rc:
                                            if isinstance(rc, str):
                                                try:
                                                    rc = json.loads(rc)
                                                except:
                                                    rc = []
                                            if isinstance(rc, list):
                                                for chunk in rc:
                                                    if "TargetContent" in chunk and len(chunk["TargetContent"]) > 10000:
                                                        with open(os.path.join(output_dir, f"{d}_chunk_{idx}.tsx"), "w", encoding="utf-8") as out:
                                                            out.write(chunk["TargetContent"])
                                                        idx += 1
                    except Exception as e:
                        pass
print(f"Found {idx} backups")

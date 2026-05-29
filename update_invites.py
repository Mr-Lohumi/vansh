import re

with open('js/shared-data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# For `acceptInvite`, find `saveFamilyData(familyMembers);\n  return true;`
content = re.sub(
    r'(if \(rel === \'BROTHER\' \|\| rel === \'SISTER\'\) \{.*?linkSiblings\(fromUser, toUser\);\s*\})(.*?)(saveFamilyData\(familyMembers\);\s*return true;)',
    r'\1\2\n  autoInferEdges(fromUser.id);\n  autoInferEdges(toUser.id);\n  \3',
    content,
    flags=re.DOTALL
)

# For `processCloudInvite`, same thing
content = re.sub(
    r'(if \(rel === \'BROTHER\' \|\| rel === \'SISTER\'\) \{.*?linkSiblings\(fromUser, toUser\);\s*\})(.*?)(saveFamilyData\(familyMembers\);\s*return true;\s*\})',
    r'\1\2\n  autoInferEdges(fromUser.id);\n  autoInferEdges(toUser.id);\n  \3',
    content,
    flags=re.DOTALL
)

with open('js/shared-data.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated acceptInvite in shared-data.js")

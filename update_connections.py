import re

def update_connections():
    with open('js/shared-tree.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Make all connections solid in Vanshavali
    old_solid_check = "const isSolid = sourceDirect && isTargetDirect;"
    new_solid_check = "const isSolid = true; // Vanshavali uses solid lines for all direct descendants"
    content = content.replace(old_solid_check, new_solid_check)

    old_marr_solid = "const isSolid = isDirect(m1.id) && isDirect(m2.id);"
    new_marr_solid = "const isSolid = true;"
    content = content.replace(old_marr_solid, new_marr_solid)

    with open('js/shared-tree.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Updated tree connections to solid for Vanshavali")

update_connections()

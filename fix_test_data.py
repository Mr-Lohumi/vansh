import re

def fix_test_data():
    with open('test_vanshavali_fixed.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Add spouse field to hari and pankaj
    content = content.replace(
        "familyMembers.push({ id: 'hari', firstName: 'Hari', lastName: 'Singh', gender: 'M', parents: [] });",
        "familyMembers.push({ id: 'hari', firstName: 'Hari', lastName: 'Singh', gender: 'M', spouse: 'hari_wife', parents: [] });"
    )
    content = content.replace(
        "familyMembers.push({ id: 'pankaj', firstName: 'Pankaj', lastName: 'Singh', gender: 'M', parents: ['mahesh'] });",
        "familyMembers.push({ id: 'pankaj', firstName: 'Pankaj', lastName: 'Singh', gender: 'M', spouse: 'riya', parents: ['mahesh'] });"
    )

    # Mock localStorage to fix error
    content = content.replace("global.window = {};", "global.window = {};\nglobal.localStorage = { getItem: () => true, setItem: () => {} };")

    with open('test_vanshavali_fixed.js', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Fixed test data")

fix_test_data()

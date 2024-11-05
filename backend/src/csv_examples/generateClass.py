import pandas as pd
from faker import Faker
import random

# Initialize Faker and define number of entries
fake = Faker()
num_students = 212
num_classes = 14
num_tutors = 7

# Generate unique classes
classes = [{"classId": i + 1, "className": f"H{str(i + 10)}A"} for i in range(num_classes)]

# Generate unique tutors
tutors = [
    {"tutorId": f"z{fake.random_number(digits=7, fix_len=True)}", "tutorName": fake.first_name() + " " + fake.last_name()}
    for _ in range(num_tutors)
]

# Assign each class a tutor
for cls in classes:
    cls["tutor"] = random.choice(tutors)

# Generate students and assign them to classes
students = []
for _ in range(num_students):
    student = {
        "fullname": fake.first_name() + " " + fake.last_name(),
        "zId": f"z{fake.random_number(digits=7, fix_len=True)}",
        "email": fake.email(),
        "class": random.choice(classes)
    }
    students.append(student)

# Create rows for CSV by joining students, classes, and tutors
data = []
for student in students:
    row = {
        "fullname": student["fullname"],
        "zId": student["zId"],
        "email": student["email"],
        "classId": student["class"]["classId"],
        "className": student["class"]["className"],
        "startTime": fake.time(pattern="%I:%M %p"),
        "duration": fake.random_int(min=1, max=3),
        "Day": fake.day_of_week(),
        "tutorId": student["class"]["tutor"]["tutorId"],
        "tutorName": student["class"]["tutor"]["tutorName"]
    }
    data.append(row)

# Convert to DataFrame and export as CSV
df = pd.DataFrame(data)
df.to_csv("sampleclass.csv", index=False, quotechar='"')

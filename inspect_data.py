import pandas as pd
import numpy as np

df = pd.read_csv('Mumbai1.csv')
if df.columns[0] == '' or df.columns[0].startswith('Unnamed'):
    df = df.iloc[:, 1:]

print("--- DATASET OVERVIEW ---")
print("Shape:", df.shape)
print("Columns:", df.columns.tolist())
print("\nMissing values per column:")
print(df.isnull().sum())

print("\nDuplicates count:", df.duplicated().sum())

print("\nTarget (Price) summary:")
print(df['Price'].describe())

print("\nArea summary:")
print(df['Area'].describe())

print("\nBedrooms distribution:")
print(df['No. of Bedrooms'].value_counts().sort_index())

print("\nNew/Resale distribution:")
print(df['New/Resale'].value_counts())

amenities = ['Gymnasium', 'Lift Available', 'Car Parking', 'Maintenance Staff', '24x7 Security',
             "Children's Play Area", 'Clubhouse', 'Intercom', 'Landscaped Gardens',
             'Indoor Games', 'Gas Connection', 'Jogging Track', 'Swimming Pool']
print("\nAmenities presence:")
for a in amenities:
    print(f"  {a}: {df[a].mean()*100:.1f}%")

print("\nTop 20 locations by count:")
print(df['Location'].value_counts().head(20))

print("\nBottom 10 locations by count:")
print(df['Location'].value_counts().tail(10))

print("\nPrice per sq ft summary:")
price_per_sqft = df['Price'] / df['Area']
print(price_per_sqft.describe())

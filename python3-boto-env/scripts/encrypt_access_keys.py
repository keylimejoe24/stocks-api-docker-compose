from cryptography.fernet import Fernet
import os

key = 'QHVrRmdsKvjYxi9oCrwuc4GKJXYc_YvmXUpenLe_YIw='
cipher_suite = Fernet(key)

encoded_access_key = 'gAAAAABjo2t0pc43iTHcD-uNWex7dtQxJc970dwc4KCzbcDr6BgMmd9QfEipubO49nWmg8VOFiv-NwSULZHbmxZyZbqfLnqvdVPmWyg65Zp0IH3Z502fLts='
decoded_access_key = cipher_suite.decrypt(encoded_access_key)

encoded_secret_access_key = 'gAAAAABjo2t0zmywwFHqsksLjGLz8CzhRoWUyJrrdCSxr5piJqg0Er0SXnnXBRW0hn7Y5q9isl-wXo9CACczKeHa3NZVqGr1r3ViHaWUbJZeernRfz06dTxHOnXpdigxzT1YCJMlgXwT'
decoded_secret_access_key = cipher_suite.decrypt(encoded_secret_access_key)

os.environ['AWS_ACCESS_KEY'] = decoded_access_key.decode()
print(decoded_access_key.decode())
os.environ['AWS_SECRET_ACCESS_KEY'] = decoded_secret_access_key.decode()
print(decoded_secret_access_key.decode())
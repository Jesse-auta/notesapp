import bcrypt

def hash_password(password):

    password_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())

    return hashed.decode("utf-8")


def check_password(password, hashed):

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8")
    )
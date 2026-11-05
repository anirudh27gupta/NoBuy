from db import execute_query
import logging

logger = logging.getLogger(__name__)

def create_notification(user_id, title, message, notif_type='general', link=None):
    """
    Creates a notification for a user in the MySQL database.
    """
    try:
        execute_query(
            """INSERT INTO notifications (user_id, title, message, type, link)
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, title, message, notif_type, link),
            commit=True
        )
    except Exception as e:
        logger.error(f"Failed to create notification for user {user_id}: {e}")

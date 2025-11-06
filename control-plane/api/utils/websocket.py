"""
WebSocket connection manager for real-time updates
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and broadcasts"""

    def __init__(self):
        # Map of user_id to set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Map of WebSocket to user_id
        self.connection_users: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and register a new WebSocket connection"""
        await websocket.accept()

        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()

        self.active_connections[user_id].add(websocket)
        self.connection_users[websocket] = user_id

        logger.info(f"WebSocket connected for user: {user_id}")
        logger.info(f"Total connections: {self.get_connection_count()}")

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        user_id = self.connection_users.get(websocket)

        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)

            # Clean up empty user sets
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

        if websocket in self.connection_users:
            del self.connection_users[websocket]

        logger.info(f"WebSocket disconnected for user: {user_id}")
        logger.info(f"Total connections: {self.get_connection_count()}")

    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user's connections"""
        if user_id not in self.active_connections:
            return

        message_str = json.dumps(message)
        disconnected = set()

        for connection in self.active_connections[user_id]:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error sending to user {user_id}: {e}")
                disconnected.add(connection)

        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected clients"""
        message_str = json.dumps(message)
        disconnected = []

        for user_id, connections in list(self.active_connections.items()):
            for connection in list(connections):
                try:
                    await connection.send_text(message_str)
                except Exception as e:
                    logger.error(f"Error broadcasting to user {user_id}: {e}")
                    disconnected.append(connection)

        # Clean up disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_device_update(self, device_data: dict):
        """Broadcast device update to all clients"""
        message = {
            "type": "device_update",
            "data": device_data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        await self.broadcast(message)
        logger.info(f"Broadcasted device update: {device_data.get('device_id')}")

    async def broadcast_task_update(self, task_data: dict):
        """Broadcast task update to all clients"""
        message = {
            "type": "task_update",
            "data": task_data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        await self.broadcast(message)
        logger.info(f"Broadcasted task update: {task_data.get('id')}")

    async def broadcast_customer_update(self, customer_data: dict):
        """Broadcast customer update to all clients"""
        message = {
            "type": "customer_update",
            "data": customer_data,
            "timestamp": datetime.utcnow().isoformat(),
        }
        await self.broadcast(message)
        logger.info(f"Broadcasted customer update: {customer_data.get('id')}")

    async def send_notification(self, notification: dict, user_id: str = None):
        """Send a notification to specific user or all users"""
        message = {
            "type": "notification",
            "data": notification,
            "timestamp": datetime.utcnow().isoformat(),
        }

        if user_id:
            await self.send_personal_message(message, user_id)
        else:
            await self.broadcast(message)

    def get_connection_count(self) -> int:
        """Get total number of active connections"""
        return sum(len(connections) for connections in self.active_connections.values())

    def get_user_count(self) -> int:
        """Get number of unique users connected"""
        return len(self.active_connections)


# Global connection manager instance
manager = ConnectionManager()

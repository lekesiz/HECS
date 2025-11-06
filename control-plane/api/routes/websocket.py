"""
WebSocket routes for real-time updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from utils.websocket import manager
from utils.security import verify_token
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.

    Client must send authentication message first:
    {
        "type": "auth",
        "token": "JWT_TOKEN"
    }
    """
    user_id = None

    try:
        # Accept the connection
        await websocket.accept()
        logger.info("WebSocket connection accepted, waiting for auth...")

        # Wait for authentication message
        try:
            auth_message = await websocket.receive_text()
            auth_data = json.loads(auth_message)

            if auth_data.get("type") != "auth":
                await websocket.send_json({
                    "type": "error",
                    "message": "First message must be auth"
                })
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            token = auth_data.get("token")
            if not token:
                await websocket.send_json({
                    "type": "error",
                    "message": "Token required"
                })
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            # Verify token
            try:
                payload = verify_token(token)
                user_id = payload.get("sub")  # username from token

                if not user_id:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Invalid token"
                    })
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return

            except Exception as e:
                logger.error(f"Token verification failed: {e}")
                await websocket.send_json({
                    "type": "error",
                    "message": "Authentication failed"
                })
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return

            # Register the authenticated connection
            # Note: We're not calling connect here because we already accepted
            # Instead, we manually register it
            if user_id not in manager.active_connections:
                manager.active_connections[user_id] = set()
            manager.active_connections[user_id].add(websocket)
            manager.connection_users[websocket] = user_id

            logger.info(f"WebSocket authenticated for user: {user_id}")

            # Send success message
            await websocket.send_json({
                "type": "auth_success",
                "message": "Connected successfully",
                "user_id": user_id
            })

            # Keep connection alive and handle messages
            while True:
                try:
                    # Receive messages (mainly for keepalive/ping)
                    message = await websocket.receive_text()
                    data = json.loads(message)

                    # Handle ping/pong
                    if data.get("type") == "ping":
                        await websocket.send_json({"type": "pong"})

                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON from user {user_id}")
                    continue

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected during auth")
            if user_id:
                manager.disconnect(websocket)
            raise

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for user: {user_id}")
        if user_id:
            manager.disconnect(websocket)

    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if user_id:
            manager.disconnect(websocket)
        try:
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        except:
            pass

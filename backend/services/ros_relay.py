import asyncio
from contextlib import suppress

import websockets
from fastapi import WebSocket

from config import get_settings


async def relay_rosbridge(client: WebSocket) -> None:
    await client.accept()
    rosbridge_url = get_settings().rosbridge_url
    async with websockets.connect(rosbridge_url) as rosbridge:
        browser_to_ros = asyncio.create_task(_browser_to_ros(client, rosbridge))
        ros_to_browser = asyncio.create_task(_ros_to_browser(client, rosbridge))
        done, pending = await asyncio.wait({browser_to_ros, ros_to_browser}, return_when=asyncio.FIRST_COMPLETED)
        for task in pending:
            task.cancel()
        for task in done:
            task.result()


async def _browser_to_ros(client: WebSocket, rosbridge) -> None:
    while True:
        message = await client.receive_text()
        await rosbridge.send(message)


async def _ros_to_browser(client: WebSocket, rosbridge) -> None:
    while True:
        message = await rosbridge.recv()
        with suppress(RuntimeError):
            await client.send_text(message)

# Reactive-Interaction-Gateway (RIG) Logistics Demo

Run the demo:

1. Build Docker image:

    ```bash
    docker build -t local/rig-demo .
    ```

2. Start services:

    ```bash
    docker-compose up
    ```

3. Point your browser to the `index.html` file in this directory.

You should now see events popping up on the screen. Those events are consumed by RIG and forwarded to your browser.

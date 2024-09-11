Gradi Store Backend
===================

This project is a Node.js application that connects to the Shopify API using GraphQL. It's built with TypeScript and Axios.

Prerequisites
-------------

-   Node.js (v14 or higher recommended)
-   Yarn or npm

Setup
-----

1.  **Clone the Repository**

    ```
    git clone https://github.com/henry-gradiweb/gradi-store-back
    cd your_repository

    ```

2.  **Install Dependencies**

    ```
    yarn install
    npm install

    ```

3.  **Configure Environment Variables** Create a `.env` file in the project root with the following content:

    ```
    SHOPIFY_ACCESS_TOKEN=your_access_token
    SHOPIFY_STORE_URL=storehenrydev.myshopify.com

    ```

4.  **Run the Project**

    -   To transpile and execute the code:

        ```
        yarn ts-node src/index.ts
        npm run ts-node

        ```

    -   For development:

        ```
        yarn tsc --watch
        npm run watch
        ```
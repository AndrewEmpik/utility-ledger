# UtilityLedger

## Description

**UtilityLedger** is a backend service for tracking and analyzing utility consumption (gas, electricity).

_The application features a Ukrainian-language interface._

## Quickstart

### Install dependencies

```bash
$ yarn install
```

### Environment Configuration

#### .env file

Create a `.env` file in the root of the project. Add the following environment variable:

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>?schema=public
```

This variable is required for connecting to your PostgreSQL database and must be customized to match your specific database setup.

## Running the app

```bash
# production mode
$ npx nest start

# development in watch mode
$ npx nest start --watch
```

## Web Interface

Once the application is running, you can access the Web interface at:

- **Localhost**:

  [http://localhost:3020/](http://localhost:3020/)

- **Local Network**:

  The application will also provide a local IP address in the logs. For example:

  ```plaintext
  App is running on local address: http://192.168.50.181:3020
  ```

  This local address will be accessible within your local network, allowing other devices on the same network to access the Web interface.

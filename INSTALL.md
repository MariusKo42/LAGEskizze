# Installation

1. Clone the repository
    ```
    # using ssh
    git clone git@github.com:eftas/LAGEskizze.git
    
    # using https
    git clone https://github.com/eftas/LAGEskizze.git
    ```
2. Install dependencies
    ```
    # change into src sub folder
    cd src
    
    # install node dependencies
    npm install
    
    # install bower dependencies
    bower install
    ```
3. Run application
    ```
    # from within the src directory
    node_modules/.bin/electron .
    ```
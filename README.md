## Inspiration
A person dies by suicide about every **11.9** minutes in the United States. About **210** people committed suicide during the time of the hackathon.

What if, we can change this and save lives?

When someone is going to commit suicide, it is the people around him that are more likely to be the angel to save, to give new birth to the poor lost soul.

## Suibirth
Suibirth is our attempt to make the world better as a hackathon project using APIs from [GenomeLink](https://genomelink.io/developers/) and [Twilio](https://www.twilio.com/).

Suibirth detects potential suicide and sends text messages to remind people around him/her. In the meantime, Suibirth is going to make a phone call to the suicide to make him/her give away the terrible thought.

## Install
1. For the backend, all the dependencies are included in the `package.json` file. So simply run

    `npm install` or `sudo npm install`

2. Certain database `suibirth` has to be established on the server end, including the following tables:

    ```
    users
    -----------------------------------
    username    varchar     primary_key    
    password    varchar
    score       int

    user_location
    -----------------------------------
    username    varchar     foreign_key
    location    point       spatial_index

    danger_spot
    -----------------------------------
    id      int         primary_key
    area    polygon     spatial_index
    ```

3. Change correspoding API token in the `server.js` with [GenomeLink](https://genomelink.io/developers/) and [Twilio](https://www.twilio.com/).


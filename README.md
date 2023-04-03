<div id="top"></div>

<!-- PROJECT LOGO -->
<br />
<div align="center">

<h3 align="center">@knovator/image-resizer</h3>
  <p align="center">
    Express middleware for resizing images.
    <br />
    <a href="https://github.com/knovator/image-resizer"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/knovator/image-resizer">View Demo</a>
    ·
    <a href="https://github.com/knovator/image-resizer/issues">Report Bug</a>
    ·
    <a href="https://github.com/knovator/image-resizer/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>


<!-- ABOUT THE PROJECT -->
## About The Project

- `@knovator/image-resizer` is an express middleware that generates images of size and format passed in **URL** using `sharp` package. 
- `@knovator/image-resizer` takes input of `public` folder path and when it receives a request it checks if the requested image exists in the `public` folder. If it doesn't, it generates the image in *resolution* folder.
- *resolution* is passed in the **URL** as `width` and `height` parameters. For example, in `/images/1200x850/image.jpg` URL `1200` is width and `850` is height. It accepts *resolution* from 2 digits to 6 digits..
- Image generation done in following setps:
  - Check if the image exists in the `public` folder by removing resolution. For example
    - `/images/800x800/image.jpg` will be checked in `/images/image.(jpg|png|webp|jpeg)`.
  - If the image doesn't exist, it generates the image in  specified *resolution* folder.
- It also generates images of different format in *resolution* folder if the image of that format is not exists. 
  - For example `/images/800x800/image.jpg` image request will be generated as `/images/800x800/image.jpg` by taking `/images/image.(jpg|png|webp|jpeg)` as input.
> It's required to use `resize` middleware before using `express.static` middleware.

<p align="right">(<a href="#top">back to top</a>)</p>


### Built With

* [sharp](https://www.npmjs.com/package/sharp)
* [glob](https://www.npmjs.com/package/glob)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

`@knovator/image-resizer` is built as an express middleware, so NodeJS application setup with expressjs is required to start.

### Installation

1. Install the package
   ```sh
   npm i @knovator/image-resizer
   # or
   yarn add @knovator/image-resizer
   ```

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- USAGE EXAMPLES -->
## Usage

- Usage of `@knovator/image-resizer` is simple. It takes input of public folder path similar to `express.static` middleware.For example,
  ```js
  const { resize } = require('@knovator/image-resizer');

  app.use(resize(__dirname + '/public'));
  ```
- `@knovator/image-resizer` considers `jpg`, `png`, `webp` and `jpeg` image formats. if you want to use other formats, you can pass it in the `extensions` parameter. For example,
  ```js
  const { resize } = require('@knovator/image-resizer');

  app.use(resize(__dirname + '/public', { extensions: ['.png', '.jpg', '.jpeg', '.webp'] }));
  ```

### Example in app.js file
```js
const express = require('express');
const app = express();
const PORT = 8080;
const { resize } = require('@knovator/image-resize');

app.get('/status', (_req, res) => {
    res.send('All Okay');
});

app.use(resize(__dirname + '/public'));
app.use(express.static(__dirname + '/public'));

app.listen(PORT, () => {
    console.log(`App started on ${PORT}`);
});
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Usecases

`@knovator/image-resizer` is built to generate images of different resolution and format. It can be used in following usecases:

- Generate images of different resolution like `600x600`, `1280x720`, `1920x1080` etc.
- Generate images of different formats like `webp`, `png`, `jpg` etc.
- Doing image transformation on the basis of requests.
- Serving and transforming images from local folder.

If you have any other usecase, please open an issue with tag `usecase`. We will try to add it in our roadmap.

<!-- ROADMAP -->
## Roadmap

- [ ] Add test cases

See the [open issues](https://github.com/knovator/image-resizer/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Knovator Technologies
- Twitter [@knovator](https://twitter.com/knovator)
- Web [https://knovator.com/](https://knovator.com/)
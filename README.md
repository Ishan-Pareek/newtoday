# newwwwwToday

A modern React-based news app that fetches live headlines using NewsAPI. Premium white & gold editorial design with smooth GSAP animations.

## Features

- Live news via NewsAPI
- Auto-refresh every 60 seconds
- Premium white & gold UI
- GSAP animations (stagger in/out, scroll reveal, hover)
- Responsive, mobile-first layout
- Category filters (All, Tech, Sports, World, Business)
- Like articles (local state)
- Loading skeleton & last updated indicator

## Tech stack

- React (JavaScript)
- GSAP
- NewsAPI
- Vite

## Installation

Clone the repo:

```bash
git clone https://github.com/Ishan-Pareek/newtoday.git
cd newtoday
```

Install and run:

```bash
npm install
npm run dev
```

## Environment variables

Create a `.env` file in the root:

```
VITE_NEWS_API_KEY=your_newsapi_key
```

Get a key at [newsapi.org](https://newsapi.org/register).

## Project structure

```
src/
├── App.jsx
├── App.css
├── main.jsx
├── index.css
├── components/
│   ├── NewsCard.jsx
│   └── NewsCardSkeleton.jsx
├── hooks/
│   └── useNews.js
├── animations/
│   └── gsapAnimations.js
└── data/
```

## Author

Ishan Pareek

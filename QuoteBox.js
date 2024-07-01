import React from 'react';

const QuoteBox = ({ quote, author, fetchQuote }) => {
  return (
    <div id="quote-box" className="text-center">
      <p id="text">{quote}</p>
      <p id="author">- {author}</p>
      <button id="new-quote" className="btn btn-primary" onClick={fetchQuote}>
        New Quote
      </button>
      <a
        id="tweet-quote"
        className="btn btn-info"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${quote} - ${author}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Tweet Quote
      </a>
    </div>
  );
};

export default QuoteBox;

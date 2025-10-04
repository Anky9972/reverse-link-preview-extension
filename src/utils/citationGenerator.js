/**
 * Citation Generator
 * Generates citations for academic references in various formats.
 * 
 * @file src/utils/citationGenerator.js
 * @version 2.0.0
 */

// Format options
const CITATION_FORMATS = {
  APA: 'apa',
  MLA: 'mla',
  CHICAGO: 'chicago',
  HARVARD: 'harvard',
  IEEE: 'ieee'
};

/**
 * Gets current date in a structured format
 * @returns {Object} Date object with day, month, year, and formatted strings
 */
const getCurrentDate = () => {
  const date = new Date();
  return {
    day: date.getDate(),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
    monthName: date.toLocaleString('en-US', { month: 'long' }),
    monthShort: date.toLocaleString('en-US', { month: 'short' })
  };
};

/**
 * Safely parses a URL hostname
 * @param {string} url - The URL to parse
 * @returns {string} The hostname or fallback
 */
const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    console.warn('Invalid URL provided:', url);
    return 'Unknown Source';
  }
};

/**
 * Gets an initial from a name, with safety checks
 * @param {string} name - The name to get initial from
 * @returns {string} The initial with period, or empty string
 */
const getInitial = (name) => {
  return name && name.length > 0 ? `${name.charAt(0)}.` : '';
};

/**
 * Extracts author information from DOM or schema data
 * @param {Object} data - The data object containing page information
 * @returns {Array} Array of author objects
 */
const extractAuthors = (data) => {
  if (!data) return [];

  // If we have author data directly
  if (data.author) {
    if (typeof data.author === 'string') {
      return [parseAuthorString(data.author)];
    } else if (Array.isArray(data.author)) {
      return data.author.map(author =>
        typeof author === 'string' ? parseAuthorString(author) : author
      );
    }
  }

  return [];
};

/**
 * Parses author string into structured format
 * @param {string} authorString - Author name as string
 * @returns {Object} Structured author object
 */
const parseAuthorString = (authorString) => {
  if (!authorString || typeof authorString !== 'string') {
    return {
      lastName: 'Unknown',
      firstName: '',
      middleName: ''
    };
  }

  const parts = authorString.trim().split(/\s+/);

  if (parts.length === 0) {
    return {
      lastName: 'Unknown',
      firstName: '',
      middleName: ''
    };
  }

  if (parts.length === 1) {
    return {
      lastName: parts[0],
      firstName: '',
      middleName: ''
    };
  }

  if (parts.length === 2) {
    return {
      firstName: parts[0],
      middleName: '',
      lastName: parts[1]
    };
  }

  // Handle cases with middle names or multiple last names
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(' '),
    lastName: parts[parts.length - 1]
  };
};

/**
 * Formats a single author for APA style
 * @param {Object} author - Author object
 * @returns {string} Formatted author string
 */
const formatAuthorAPA = (author) => {
  let authorStr = `${author.lastName}, ${getInitial(author.firstName)}`;
  if (author.middleName) {
    authorStr += ` ${getInitial(author.middleName)}`;
  }
  return authorStr;
};

/**
 * Generates APA citation (7th edition)
 * @param {Object} data - The page data
 * @returns {string} APA formatted citation
 */
const generateAPACitation = (data) => {
  const authors = extractAuthors(data);
  const currentDate = getCurrentDate();

  // Format authors
  let authorText = '';
  if (authors.length === 0) {
    authorText = 'N.A.';
  } else if (authors.length === 1) {
    authorText = formatAuthorAPA(authors[0]);
  } else if (authors.length <= 20) {
    authorText = authors.map(formatAuthorAPA).join(', ');
  } else {
    // APA 7th edition: Include first 19 authors, then ellipsis, then last author
    const first19 = authors.slice(0, 19).map(formatAuthorAPA).join(', ');
    const last = formatAuthorAPA(authors[authors.length - 1]);
    authorText = `${first19}, ... ${last}`;
  }

  // Format date
  const publicationDate = data.publishDate ? new Date(data.publishDate) : null;
  const year = publicationDate ? publicationDate.getFullYear() : 'n.d.';

  // Format title
  const title = data.title || 'Untitled';

  // Format URL
  const url = data.url || '';

  // Format website name
  const siteName = data.siteName || getHostname(url);

  // Build citation
  return `${authorText} (${year}). ${title}. ${siteName}. Retrieved ${currentDate.monthName} ${currentDate.day}, ${currentDate.year}, from ${url}`;
};

/**
 * Generates MLA citation (9th edition)
 * @param {Object} data - The page data
 * @returns {string} MLA formatted citation
 */
const generateMLACitation = (data) => {
  const authors = extractAuthors(data);
  const currentDate = getCurrentDate();

  // Format authors
  let authorText = '';
  if (authors.length === 0) {
    authorText = 'N.A.';
  } else if (authors.length === 1) {
    const author = authors[0];
    authorText = `${author.lastName}, ${author.firstName}`;
    if (author.middleName) {
      authorText += ` ${author.middleName}`;
    }
  } else if (authors.length === 2) {
    const author1 = authors[0];
    const author2 = authors[1];
    authorText = `${author1.lastName}, ${author1.firstName}`;
    if (author1.middleName) {
      authorText += ` ${author1.middleName}`;
    }
    authorText += `, and ${author2.firstName}`;
    if (author2.middleName) {
      authorText += ` ${author2.middleName}`;
    }
    authorText += ` ${author2.lastName}`;
  } else {
    const author = authors[0];
    authorText = `${author.lastName}, ${author.firstName}`;
    if (author.middleName) {
      authorText += ` ${author.middleName}`;
    }
    authorText += ', et al.';
  }

  // Format title
  const title = data.title ? `"${data.title}"` : '"Untitled"';

  // Format URL
  const url = data.url || '';

  // Format website name
  const siteName = data.siteName || getHostname(url);

  // Format publication date
  const publicationDate = data.publishDate ? new Date(data.publishDate) : null;
  let dateText = '';
  if (publicationDate && !isNaN(publicationDate.getTime())) {
    const day = publicationDate.getDate();
    const month = publicationDate.toLocaleString('en-US', { month: 'long' });
    const year = publicationDate.getFullYear();
    dateText = `, ${day} ${month} ${year}`;
  }

  // Build citation
  return `${authorText}. ${title}. ${siteName}${dateText}, ${url}. Accessed ${currentDate.day} ${currentDate.monthName} ${currentDate.year}.`;
};

/**
 * Generates Chicago style citation (17th edition - Notes and Bibliography)
 * @param {Object} data - The page data
 * @returns {string} Chicago formatted citation
 */
const generateChicagoCitation = (data) => {
  const authors = extractAuthors(data);
  const currentDate = getCurrentDate();

  // Format authors
  let authorText = '';
  if (authors.length === 0) {
    authorText = 'N.A.';
  } else if (authors.length === 1) {
    const author = authors[0];
    authorText = `${author.lastName}, ${author.firstName}`;
    if (author.middleName) {
      authorText += ` ${author.middleName}`;
    }
  } else if (authors.length <= 3) {
    const firstAuthor = authors[0];
    authorText = `${firstAuthor.lastName}, ${firstAuthor.firstName}`;
    if (firstAuthor.middleName) {
      authorText += ` ${firstAuthor.middleName}`;
    }

    for (let i = 1; i < authors.length; i++) {
      const author = authors[i];
      if (i === authors.length - 1) {
        authorText += `, and ${author.firstName}`;
        if (author.middleName) {
          authorText += ` ${author.middleName}`;
        }
        authorText += ` ${author.lastName}`;
      } else {
        authorText += `, ${author.firstName}`;
        if (author.middleName) {
          authorText += ` ${author.middleName}`;
        }
        authorText += ` ${author.lastName}`;
      }
    }
  } else {
    const firstAuthor = authors[0];
    authorText = `${firstAuthor.lastName}, ${firstAuthor.firstName}`;
    if (firstAuthor.middleName) {
      authorText += ` ${firstAuthor.middleName}`;
    }
    authorText += ', et al.';
  }

  // Format title
  const title = data.title ? `"${data.title}."` : '"Untitled."';

  // Format URL
  const url = data.url || '';

  // Format website name
  const siteName = data.siteName || getHostname(url);

  // Format publication date
  const publicationDate = data.publishDate ? new Date(data.publishDate) : null;
  let dateText = '';
  if (publicationDate && !isNaN(publicationDate.getTime())) {
    const month = publicationDate.toLocaleString('en-US', { month: 'long' });
    const day = publicationDate.getDate();
    const year = publicationDate.getFullYear();
    dateText = `${month} ${day}, ${year}`;
  } else {
    dateText = 'n.d.';
  }

  // Build citation
  return `${authorText}. ${title} ${siteName}. ${dateText}. Accessed ${currentDate.monthName} ${currentDate.day}, ${currentDate.year}. ${url}.`;
};

/**
 * Generates Harvard style citation
 * @param {Object} data - The page data
 * @returns {string} Harvard formatted citation
 */
const generateHarvardCitation = (data) => {
  const authors = extractAuthors(data);
  const currentDate = getCurrentDate();

  // Format authors
  let authorText = '';
  if (authors.length === 0) {
    authorText = 'Anon.';
  } else if (authors.length === 1) {
    const author = authors[0];
    authorText = `${author.lastName}, ${getInitial(author.firstName)}`;
    if (author.middleName) {
      authorText += ` ${getInitial(author.middleName)}`;
    }
  } else if (authors.length <= 3) {
    authorText = authors.map((author) => {
      let authorStr = `${author.lastName}, ${getInitial(author.firstName)}`;
      if (author.middleName) {
        authorStr += ` ${getInitial(author.middleName)}`;
      }
      return authorStr;
    }).join(', ');
  } else {
    const author = authors[0];
    authorText = `${author.lastName}, ${getInitial(author.firstName)}`;
    if (author.middleName) {
      authorText += ` ${getInitial(author.middleName)}`;
    }
    authorText += ' et al.';
  }

  // Format publication date
  const publicationDate = data.publishDate ? new Date(data.publishDate) : null;
  const year = publicationDate && !isNaN(publicationDate.getTime()) 
    ? publicationDate.getFullYear() 
    : 'n.d.';

  // Format title
  const title = data.title || 'Untitled';

  // Format URL
  const url = data.url || '';

  // Format website name
  const siteName = data.siteName || getHostname(url);

  // Build citation
  return `${authorText} (${year}). ${title}. [online] ${siteName}. Available at: ${url} [Accessed ${currentDate.day} ${currentDate.monthName} ${currentDate.year}].`;
};

/**
 * Generates IEEE style citation
 * @param {Object} data - The page data
 * @returns {string} IEEE formatted citation
 */
const generateIEEECitation = (data) => {
  const authors = extractAuthors(data);
  const currentDate = getCurrentDate();

  // Format authors
  let authorText = '';
  if (authors.length === 0) {
    authorText = '';
  } else if (authors.length === 1) {
    const author = authors[0];
    authorText = `${getInitial(author.firstName)}`;
    if (author.middleName) {
      authorText += ` ${getInitial(author.middleName)}`;
    }
    authorText += ` ${author.lastName}`;
  } else if (authors.length <= 6) {
    authorText = authors.map((author) => {
      let authorStr = `${getInitial(author.firstName)}`;
      if (author.middleName) {
        authorStr += ` ${getInitial(author.middleName)}`;
      }
      authorStr += ` ${author.lastName}`;
      return authorStr;
    }).join(', ');
  } else {
    authorText = authors.slice(0, 6).map((author) => {
      let authorStr = `${getInitial(author.firstName)}`;
      if (author.middleName) {
        authorStr += ` ${getInitial(author.middleName)}`;
      }
      authorStr += ` ${author.lastName}`;
      return authorStr;
    }).join(', ');
    authorText += ' et al.';
  }

  // Format title
  const title = data.title ? `"${data.title},"` : '"Untitled,"';

  // Format URL
  const url = data.url || '';

  // Format website name
  const siteName = data.siteName || getHostname(url);

  // Format publication date
  const publicationDate = data.publishDate ? new Date(data.publishDate) : null;
  let dateText = '';
  if (publicationDate && !isNaN(publicationDate.getTime())) {
    const month = publicationDate.toLocaleString('en-US', { month: 'short' });
    const day = publicationDate.getDate();
    const year = publicationDate.getFullYear();
    dateText = `${day} ${month}. ${year}`;
  } else {
    dateText = 'n.d.';
  }

  // Build citation
  return `${authorText ? authorText + ", " : ""}${title} ${siteName}, ${dateText}. [Online]. Available: ${url}. [Accessed: ${currentDate.day} ${currentDate.monthShort}. ${currentDate.year}].`;
};

/**
 * Generate citation for a URL in the specified format
 * @param {string} format - The citation format to use
 * @param {Object} data - The page data
 * @returns {string} The formatted citation
 */
export const citationGenerator = (format, data) => {
  if (!data || typeof data !== 'object') {
    console.error('Invalid data provided to citationGenerator');
    return 'Invalid citation data';
  }

  const normalizedFormat = format ? format.toLowerCase() : 'apa';

  switch (normalizedFormat) {
    case CITATION_FORMATS.APA:
      return generateAPACitation(data);
    case CITATION_FORMATS.MLA:
      return generateMLACitation(data);
    case CITATION_FORMATS.CHICAGO:
      return generateChicagoCitation(data);
    case CITATION_FORMATS.HARVARD:
      return generateHarvardCitation(data);
    case CITATION_FORMATS.IEEE:
      return generateIEEECitation(data);
    default:
      console.warn(`Unknown citation format: ${format}, defaulting to APA`);
      return generateAPACitation(data);
  }
};

// Export formats constant for external use
export { CITATION_FORMATS };

export default citationGenerator;
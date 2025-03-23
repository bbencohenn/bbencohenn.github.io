const snippets = [
    {
      title: "Reverse a String (Python)",
      code: `def reverse_string(s):
      return s[::-1]`,
      language: "python"
    },
    {
      title: "FizzBuzz (JavaScript)",
      code: `for (let i = 1; i <= 100; i++) {
    let output = '';
    if (i % 3 === 0) output += 'Fizz';
    if (i % 5 === 0) output += 'Buzz';
    console.log(output || i);
  }`,
      language: "javascript"
    },
    {
      title: "SQL: Select Top 5 Customers by Spending",
      code: `SELECT customer_id, SUM(total) AS total_spent
  FROM orders
  GROUP BY customer_id
  ORDER BY total_spent DESC
  LIMIT 5;`,
      language: "sql"
    },
    {
      title: "HTML Boilerplate",
      code: `<!DOCTYPE html>
  <html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
  </body>
  </html>`,
      language: "html"
    },
    {
      title: "Center Div (CSS)",
      code: `.center {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }`,
      language: "css"
    },
    {
      title: "Bubble Sort (Java)",
      code: `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++)
      for (int j = 0; j < n-i-1; j++)
        if (arr[j] > arr[j+1]) {
          int temp = arr[j];
          arr[j] = arr[j+1];
          arr[j+1] = temp;
        }
  }`,
      language: "java"
    },
    {
      title: "R: Summary Stats",
      code: `data <- c(5, 10, 15, 20)
  summary(data)`,
      language: "r"
    },
    {
      title: "Check Prime (Python)",
      code: `def is_prime(n):
      if n < 2: return False
      for i in range(2, int(n**0.5)+1):
          if n % i == 0:
              return False
      return True`,
      language: "python"
    },
    {
      title: "Debounce Function (JavaScript)",
      code: `function debounce(func, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  }`,
      language: "javascript"
    },
    {
      title: "SQL: Count NULLs in a Column",
      code: `SELECT COUNT(*)
  FROM table
  WHERE column IS NULL;`,
      language: "sql"
    },
    {
      title: "CSS: Gradient Background",
      code: `body {
    background: linear-gradient(to right, #ff6e42, #ffca42);
  }`,
      language: "css"
    },
    {
      title: "Capitalize Each Word (Python)",
      code: `def title_case(text):
      return text.title()`,
      language: "python"
    },
    {
      title: "Random Number (JavaScript)",
      code: `const random = Math.floor(Math.random() * 100) + 1;`,
      language: "javascript"
    },
    {
      title: "Read File (Java)",
      code: `BufferedReader br = new BufferedReader(new FileReader("file.txt"));
  String line;
  while ((line = br.readLine()) != null) {
    System.out.println(line);
  }
  br.close();`,
      language: "java"
    },
    {
      title: "Linear Regression (R)",
      code: `model <- lm(mpg ~ wt, data=mtcars)
  summary(model)`,
      language: "r"
    },
    {
      title: "Python List Comprehension",
      code: `[x**2 for x in range(10) if x % 2 == 0]`,
      language: "python"
    },
    {
      title: "JavaScript Fetch API",
      code: `fetch('/api/data')
    .then(res => res.json())
    .then(data => console.log(data));`,
      language: "javascript"
    },
    {
      title: "SQL: Create Table",
      code: `CREATE TABLE users (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100)
  );`,
      language: "sql"
    },
    {
      title: "CSS: Hover Button",
      code: `.btn:hover {
    background: #ffca42;
    color: black;
  }`,
      language: "css"
    },
    {
      title: "Check Palindrome (Python)",
      code: `def is_palindrome(s):
      return s == s[::-1]`,
      language: "python"
    },
    {
      title: "JavaScript: Toggle Dark Mode",
      code: `document.body.classList.toggle('dark-mode');`,
      language: "javascript"
    },
    {
      title: "Factorial (R)",
      code: `factorial <- function(n) {
    if (n == 0) return(1)
    return(n * factorial(n - 1))
  }`,
      language: "r"
    },
    {
      title: "JavaScript: Copy to Clipboard",
      code: `navigator.clipboard.writeText("Copied text!");`,
      language: "javascript"
    },
    {
      title: "Python: Flatten List",
      code: `from itertools import chain
  flat = list(chain.from_iterable([[1,2],[3,4]]))`,
      language: "python"
    },
    {
      title: "SQL: Join Tables",
      code: `SELECT a.name, b.salary
  FROM employees a
  JOIN salaries b ON a.id = b.emp_id;`,
      language: "sql"
    },
    {
      title: "HTML5 Audio Tag",
      code: `<audio controls>
    <source src="song.mp3" type="audio/mpeg">
    Your browser does not support the audio element.
  </audio>`,
      language: "html"
    },
    {
      title: "Python: Most Common Element",
      code: `from collections import Counter
  Counter(['a','b','a','c']).most_common(1)`,
      language: "python"
    },
    {
      title: "R: Plot Data",
      code: `plot(cars$speed, cars$dist)`,
      language: "r"
    },
    {
      title: "JavaScript: Scroll to Top",
      code: `window.scrollTo({ top: 0, behavior: 'smooth' });`,
      language: "javascript"
    },
    {
      title: "Java: Singleton Pattern",
      code: `class Singleton {
    private static Singleton instance;
    private Singleton() {}
    public static Singleton getInstance() {
      if (instance == null) instance = new Singleton();
      return instance;
    }
  }`,
      language: "java"
    }
  ];


  const grid = document.querySelector(".snippet-grid");
  snippets.forEach((snippet, index) => {
    const card = document.createElement("div");
    card.classList.add("snippet-card");
    card.setAttribute("data-lang", snippet.language);

    const pre = document.createElement("pre");
    const code = document.createElement("code");

    code.className = `language-${snippet.language}`;
    code.textContent = snippet.code;
    pre.appendChild(code);

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = "Copy";
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(snippet.code);
      copyBtn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => (copyBtn.innerHTML = '<i class="fas fa-copy"></i>'), 1500);
    });

    pre.appendChild(copyBtn);
    card.innerHTML = `<h3>${snippet.title}</h3>`;
    card.appendChild(pre);
    grid.appendChild(card);
  });


  const hlScript = document.createElement("script");
  hlScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js";
  hlScript.onload = () => hljs.highlightAll();
  document.head.appendChild(hlScript);

  const hlCSS = document.createElement("link");
  hlCSS.rel = "stylesheet";
  hlCSS.href =
    "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css";
  document.head.appendChild(hlCSS);


const languages = [...new Set(snippets.map((s) => s.language))];


const filterContainer = document.createElement("div");
filterContainer.className = "snippet-filter";


let activeFilter = null;

const languageImages = {
    java: "java.webp",
    css: "css.svg",
    html: "html.png",
    sql: "sql.png",
    javascript: "js.png",
    python: "python.png",
    r: "r.png"
  };

languages.forEach((lang) => {
  const btn = document.createElement("button");
  btn.className = "filter-btn";


  const imageFile = languageImages[lang] || "default.png";


  btn.innerHTML = `
    <img
      src="resources/${imageFile}"
      alt="${lang} logo"
      style="width:20px; margin-right:6px; vertical-align:middle;">
    | ${lang.toUpperCase()}
  `;


  btn.addEventListener("click", () => {

    if (activeFilter === lang) {
      activeFilter = null;
      btn.classList.remove("active-filter");
      document.querySelectorAll(".snippet-card").forEach((card) => {
        card.style.display = "block";
      });
    } else {

      activeFilter = lang;
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.remove("active-filter");
      });
      btn.classList.add("active-filter");


      document.querySelectorAll(".snippet-card").forEach((card) => {
        card.style.display =
          card.getAttribute("data-lang") === lang ? "block" : "none";
      });
    }
  });

  filterContainer.appendChild(btn);
});


document.body.insertBefore(filterContainer, grid);

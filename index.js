const btn = document.getElementById("btn");
const usernameInput = document.getElementById("username");
const loader = document.getElementById("loader");
const dashboard = document.getElementById("dashboard");
const error = document.getElementById("error");
const toggle = document.getElementById("theme-toggle");

let chartInstance = null;

/* 🌙 Theme Toggle */
toggle.onclick = () => {
  document.body.classList.toggle("light");
  toggle.textContent =
    document.body.classList.contains("light") ? "🌞" : "🌙";
};

btn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  if (!username) return;

  loader.classList.remove("hidden");
  dashboard.classList.add("hidden");
  error.classList.add("hidden");

  try {
    const res = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${username}`
    );

    if (!res.ok) throw new Error("User not found");

    const data = await res.json();

    document.getElementById("easy").textContent = data.easySolved;
    document.getElementById("medium").textContent = data.mediumSolved;
    document.getElementById("hard").textContent = data.hardSolved;
    document.getElementById("total").textContent = data.totalSolved;

    renderChart(data, username);
    dashboard.classList.remove("hidden");

  } catch {
    error.textContent = "User not found";
    error.classList.remove("hidden");
  } finally {
    loader.classList.add("hidden");
  }
});

/* 📊 PERFECT CENTER TEXT (NO TEXT MODIFICATION) */
function renderChart(data, username) {
  const canvas = document.getElementById("difficultyChart");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Easy", "Medium", "Hard"],
      datasets: [{
        data: [data.easySolved, data.mediumSolved, data.hardSolved],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      animation: {
        animateRotate: true,
        animateScale: true
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: getComputedStyle(document.body)
              .getPropertyValue("--text")
          }
        }
      }
    },
    plugins: [{
      id: "centerUsername",
      beforeDraw(chart) {
        const { ctx, chartArea } = chart;

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        const maxWidth = (chartArea.right - chartArea.left) * 0.45;

        let fontSize = 24;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        do {
          ctx.font = `600 ${fontSize}px Inter, sans-serif`;
          fontSize--;
        } while (ctx.measureText(username).width > maxWidth && fontSize > 12);

        ctx.fillStyle = getComputedStyle(document.body)
          .getPropertyValue("--text");

        ctx.fillText(username, centerX, centerY);
        ctx.save();
      }
    }]
  });
}

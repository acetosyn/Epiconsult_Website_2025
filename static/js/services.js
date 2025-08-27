
document.addEventListener("DOMContentLoaded", () => {

  // -------------------
  // SERVICES GRID
  // -------------------
  const servicesGrid = document.getElementById("services-grid");

  // --- Services Data ---
  const services = [
    {
      name: "Laboratory",
      icon: "fa-vials",
      description:
        "Comprehensive diagnostic testing using state-of-the-art equipment for accurate and timely results.",
      features: [
        "Hematology tests",
        "Clinical chemistry",
        "Microbiology",
        "Immunology",
        "Molecular diagnostics",
      ],
      dynamic: true,
    },
    {
      name: "CT Scan / MRI",
      icon: "fa-x-ray",
      description:
        "Advanced cross-sectional imaging providing detailed views of internal structures for accurate diagnosis.",
      features: [
        "CT scans with contrast",
        "MRI with advanced sequences",
        "Cardiac CT",
        "Neurological imaging",
        "Musculoskeletal imaging",
      ],
    },
    {
      name: "Mammography",
      icon: "fa-ribbon",
      description:
        "Advanced breast imaging for early detection of breast cancer and other breast abnormalities.",
      features: [
        "Digital mammography",
        "3D tomosynthesis",
        "Breast ultrasound",
        "Breast biopsy",
        "Screening and diagnostic",
      ],
    },
    {
      name: "ECG & Echo",
      icon: "fa-heartbeat",
      description:
        "Comprehensive cardiac testing services to evaluate heart function and detect cardiovascular abnormalities.",
      features: [
        "Resting ECG",
        "Stress ECG",
        "Echocardiography",
        "Transesophageal echo",
        "Cardiac event monitoring",
      ],
    },
    {
      name: "Ultrasound",
      icon: "fa-baby",
      description:
        "Non-invasive imaging using sound waves to visualize internal organs, blood flow, and pregnancy evaluations.",
      features: [
        "Abdominal ultrasound",
        "Obstetric ultrasound",
        "Doppler studies",
        "Thyroid ultrasound",
        "Musculoskeletal ultrasound",
      ],
    },
    {
      name: "X-ray Imaging",
      icon: "fa-bone",
      description:
        "High-quality radiographic imaging services for accurate diagnosis of bones, chest, and other conditions.",
      features: [
        "Digital radiography",
        "Bone and joint imaging",
        "Chest X-rays",
        "Abdomen imaging",
        "Contrast studies",
      ],
    },
    {
      name: "Hematology",
      icon: "fa-tint",
      description:
        "Specialized in the diagnosis and treatment of blood disorders, including sickle cell disease, anemia, and blood cancers.",
      features: [
        "Sickle cell disease management",
        "Anemia evaluation",
        "Bleeding disorder care",
        "Blood cancer diagnosis",
        "Iron infusion therapy",
      ],
      dynamic: true,
    },
    {
      name: "Gastroenterology",
      icon: "fa-dna",
      description:
        "Diagnosis and treatment of digestive system disorders with advanced endoscopic procedures.",
      features: [
        "Upper endoscopy (EGD)",
        "Colonoscopy services",
        "Capsule endoscopy",
        "Liver disease management",
        "GERD treatment",
      ],
    },
    {
      name: "Pulmonology",
      icon: "fa-lungs",
      description:
        "Diagnosis and treatment of conditions affecting the respiratory system using advanced diagnostic tools.",
      features: [
        "Pulmonary function testing",
        "Bronchoscopy services",
        "Sleep studies",
        "Asthma & COPD management",
        "Lung cancer screening",
      ],
    },
    {
      name: "Obs & Gynecology",
      icon: "fa-female",
      description:
        "Comprehensive women's health services from prenatal to postnatal care and beyond.",
      features: [
        "Prenatal & postnatal care",
        "Gynecological exams",
        "Family planning services",
        "Minimally invasive surgeries",
        "Menopause management",
      ],
    },
    {
      name: "Cardiology",
      icon: "fa-heart",
      description:
        "Equipped with state-of-the-art technology to diagnose and treat all types of heart conditions.",
      features: [
        "Electrocardiogram (ECG) testing",
        "Echocardiography services",
        "Holter & event monitoring",
        "Cardiac stress testing",
        "Preventive cardiology",
      ],
      dynamic: true,
    },
    {
      name: "General Outpatient",
      icon: "fa-user-md",
      description:
        "Primary care services for all ages with experienced physicians for comprehensive diagnosis and treatment.",
      features: [
        "Routine health check-ups",
        "Acute illness diagnosis",
        "Chronic condition management",
        "Vaccinations",
        "Health education",
      ],
    },
  ];

  // --- Helpers ---
  const normalizeId = (str) =>
    str.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");

  const getHeaderOffset = () => {
    const nav = document.querySelector("nav") || document.querySelector("header");
    return nav ? -(nav.offsetHeight + 24) : -120;
  };

  const animateCards = () => {
    document.querySelectorAll(".service-card").forEach((card, index) => {
      setTimeout(() => {
        card.classList.remove("opacity-0", "translate-y-6");
        card.classList.add("opacity-100", "translate-y-0");
      }, index * 150);
    });
  };

  // --- Rendering ---
  const renderServices = (data = {}) => {
    servicesGrid.innerHTML = "";

    services.forEach((service, i) => {
      const hoverColor = i % 2 === 0 ? "hover:bg-red-600" : "hover:bg-blue-600";

      const card = document.createElement("div");
      card.id = normalizeId(service.name);
      card.className =
        "service-card bg-white max-w-md mx-auto p-6 rounded-xl shadow hover:shadow-lg transition transform opacity-0 translate-y-6";

      // Dynamic content
      let dynamicContent = "";
      if (service.dynamic) {
        const deptData = data[service.name]?.services || {};
        dynamicContent = Object.values(deptData)
          .map((subDept) =>
            Object.entries(subDept)
              .map(
                ([category, tests]) => `
                <li>
                  <strong>${category}</strong>
                  <ul class="ml-4 list-disc">
                    ${tests
                      .map(
                        (t) =>
                          `<li class="hover:bg-gray-100 hover:scale-[1.02] transition rounded-md px-2 py-1 cursor-pointer">${t}</li>`
                      )
                      .join("")}
                  </ul>
                </li>
              `
              )
              .join("")
          )
          .join("");
      }

      card.innerHTML = `
        <div class="flex items-center mb-4">
          <i class="fas ${service.icon} text-navy text-3xl mr-3"></i>
          <h2 class="text-xl font-bold text-navy">${service.name}</h2>
        </div>
        <p class="text-gray-600 mb-4">${service.description}</p>
        <div class="border rounded-lg overflow-hidden">
          <button class="w-full flex justify-between items-center px-4 py-2 font-semibold bg-navy text-white ${hoverColor} transition">
            <span>Key Features & Tests</span>
            <span class="toggle-icon text-xl font-bold">+</span>
          </button>
          <div class="collapse-content max-h-0 overflow-hidden transition-all duration-500 ease-in-out">
            <ul class="px-6 py-3 space-y-2 text-sm max-h-60 overflow-y-auto scroll-smooth">
              ${service.features
                .map(
                  (f) =>
                    `<li class="hover:bg-gray-100 hover:scale-[1.02] transition rounded-md px-2 py-1 cursor-pointer">${f}</li>`
                )
                .join("")}
              ${dynamicContent}
            </ul>
          </div>
        </div>
      `;

      // Toggle accordion
      const button = card.querySelector("button");
      const content = card.querySelector(".collapse-content");
      const icon = card.querySelector(".toggle-icon");

      button.addEventListener("click", () => {
        const isClosed = content.classList.contains("max-h-0");

        // Close others
        document.querySelectorAll(".collapse-content").forEach((el) => {
          el.classList.remove("max-h-[1000px]");
          el.classList.add("max-h-0");
          if (el.dataset.timerId) {
            clearTimeout(Number(el.dataset.timerId));
            delete el.dataset.timerId;
          }
        });
        document.querySelectorAll(".toggle-icon").forEach((ic) => (ic.textContent = "+"));

        // Open this one
        if (isClosed) {
          content.classList.remove("max-h-0");
          content.classList.add("max-h-[1000px]");
          icon.textContent = "−";
        }
      });

      servicesGrid.appendChild(card);
    });

    animateCards();
  };

  // --- Scroll + Auto-open ---
  const openCard = (cardId, autoCollapse = false) => {
    const target = document.getElementById(cardId);
    if (!target) return;

    const content = target.querySelector(".collapse-content");
    const icon = target.querySelector(".toggle-icon");
    if (!content) return;

    // Close others
    document.querySelectorAll(".collapse-content").forEach((el) => {
      el.classList.remove("max-h-[1000px]");
      el.classList.add("max-h-0");
      if (el.dataset.timerId) {
        clearTimeout(Number(el.dataset.timerId));
        delete el.dataset.timerId;
      }
    });
    document.querySelectorAll(".toggle-icon").forEach((ic) => (ic.textContent = "+"));

    // Open target
    content.classList.remove("max-h-0");
    content.classList.add("max-h-[1000px]");
    if (icon) icon.textContent = "−";

    // Scroll into view after expansion
    setTimeout(() => {
      const yOffset = getHeaderOffset();
      const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 200);

    // Optional auto-collapse
    if (autoCollapse) {
      if (content.dataset.timerId) {
        clearTimeout(Number(content.dataset.timerId));
        delete content.dataset.timerId;
      }
      const id = setTimeout(() => {
        if (content.classList.contains("max-h-[1000px]")) {
          content.classList.remove("max-h-[1000px]");
          content.classList.add("max-h-0");
          if (icon) icon.textContent = "+";
        }
        delete content.dataset.timerId;
      }, 10000);
      content.dataset.timerId = String(id);
    }
  };

  // --- Init ---
  fetch("/static/data/test_data.json")
    .then((res) => res.json())
    .then((data) => {
      renderServices(data);

      // Handle initial hash
      if (window.location.hash) {
        const cardId = normalizeId(window.location.hash.substring(1));
        setTimeout(() => openCard(cardId, true), 400);
      }

      // Handle hash changes
      window.addEventListener("hashchange", () => {
        const cardId = normalizeId(window.location.hash.substring(1));
        openCard(cardId, true);
      });
    })
    .catch((err) => {
      console.error("Error loading test data:", err);
      renderServices();
    });
});

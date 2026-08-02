<p align="center">
  <img src="./assets/header-iranian-v3.png" alt="Amir Amiri Tabat — AI engineering, backend, bioinformatics, and agent memory" width="100%">
</p>

<p align="center">
  <a href="https://github.com/BMGLab"><img src="https://img.shields.io/badge/BMGLab-18181B?style=for-the-badge&logo=github&logoColor=7DD3FC" alt="BMGLab"></a>
  <a href="https://github.com/Single-Cell-Quest"><img src="https://img.shields.io/badge/Single--Cell--Quest-18181B?style=for-the-badge&logo=github&logoColor=C4B5FD" alt="Single-Cell Quest"></a>
  <a href="https://github.com/MemoryUniverse"><img src="https://img.shields.io/badge/Memory_Universe-18181B?style=for-the-badge&logo=github&logoColor=86EFAC" alt="Memory Universe"></a>
</p>

I'm an AI and backend engineer and a bioinformatics researcher based in İzmir. I enjoy the less glamorous parts of software—the data models, failure handling, pipelines, and tests that make a system dependable. My recent work has focused on multi-agent memory and single-cell RNA sequencing.

<img src="./assets/title-current-work.svg" alt="Current work" width="100%">

### Memory Universe

**[Memory Universe](https://github.com/MemoryUniverse/mu-core)** is a multi-user, multi-agent memory system. I started it because project knowledge is usually scattered across private chats, shared discussions, different teammates, and agents that cannot carry context between one another.

A Memory Universe workspace holds the durable memory of a project: decisions, tasks, evidence, constraints, artifacts, and the relationships between them. Inside that workspace, several people can work with their own agents in a shared session. The agents join under separate identities—one teammate may use Claude Code while another uses Codex—rather than acting through one shared account.

Shared work does not remove private work. Each person–agent pair can also have private sessions and private memory that stays local. A private session can use its own context together with shared context the user is allowed to see, without merging the private and shared stores.

Context can move between a private session, a shared session, and workspace memory as a selected packet—not as a dump of the full transcript. A transfer carries its source, purpose, permissions, and history; it can require approval, expire, or be revoked later. This lets one session pass its useful state and reasoning to another person or agent while keeping unrelated private context out of the handoff.

The local memory engine, capture client, and Python and TypeScript SDKs are built and being used with Claude Code and Codex. Shared multi-user sessions, governed context transitions, and the hosted coordination plane are the current private-beta work. Memory Universe also grew from my undergraduate research into long-horizon memory for agent systems.

### PeakATail

At **[BMGLab](https://github.com/BMGLab)**, I lead development of **[PeakATail](https://github.com/BMGLab/PeakATail)**, a Python package for studying alternative polyadenylation in single-cell RNA-seq data.

PeakATail starts from tagged BAM files produced by tools such as STARsolo and CellRanger. It calls poly(A) sites at read level, creates per-cell count matrices, clusters cells by their APA profiles, and supports differential APA testing, 3′ UTR length analysis, and cross-dataset cluster matching. The package is currently being benchmarked against reference poly(A) databases while we prepare the manuscript.

Alongside research code, I've worked on production backends, LLM routing and agent workflows, document-processing pipelines, real-time APIs, observability, and Linux infrastructure. I also led the IEEE Ege bioinformatics team and helped organize more than twelve technical workshops.

<img src="./assets/title-experience.svg" alt="Experience beyond GitHub" width="100%">

Much of my professional work lives in private repositories, so the public projects only show part of what I have built.

- **LiboBerry — Backend & AI Developer:** I worked on research software with multi-provider LLM routing, LangGraph and Temporal workflows, MCP tools, OCR document processing, real-time chat, and an observability stack built around OpenTelemetry, Prometheus, Grafana, and Loki.
- **Genfoquest Analytica — Backend Developer & Bioinformatician:** I was the backend and DevOps engineer for SingleCellQuest, building FastAPI services, PostgreSQL and MongoDB storage, Docker deployments, and Nextflow pipelines for single-cell analysis.
- **SKY-MOD — Backend Engineering Intern:** I built the Mail domain of a multi-tenant Microsoft Graph service, including OAuth2, encrypted tenant credentials, Redis caching, failure handling, tests, and an MCP interface for agents.
- **BMGLab — Python Developer & Researcher:** In addition to PeakATail, I build single-cell workflows and help maintain the lab's Linux and Proxmox infrastructure.

<img src="./assets/title-projects.svg" alt="Selected projects" width="100%">

| | Project | Why it matters |
|:--:|---|---|
| 🔬 | **[Bioinformatics Tutorials](https://github.com/IEEE-Ege/BioinformaticTutorials)** | Makes foundational bioinformatics problems approachable through hands-on Python workshops. |
| 🛡️ | **[MCP Tool Poisoning Demo](https://github.com/TRextabat/valun_project)** | A small vulnerable/secure pair showing how poisoned tool descriptions can manipulate an agent. |
| 🔐 | **[Secure UDP Chat](https://github.com/TRextabat/net_sec)** | Combines authenticated messaging, Argon2id, rate limits, token revocation, and session expiry. |
| 📈 | **[LSTM Price Prediction](https://github.com/TRextabat/CIDL-Project1-LSTM-Price-Prediction)** | Compares four LSTM architectures with walk-forward validation and reproducible experiments. |

<img src="./assets/title-toolkit.svg" alt="Technical toolkit" width="100%">

<p align="center">
  <img src="https://skillicons.dev/icons?i=python,go,pytorch,fastapi,django,postgres,redis,docker,kubernetes,linux,git&perline=11" alt="Python, Go, PyTorch, FastAPI, Django, PostgreSQL, Redis, Docker, Kubernetes, Linux, and Git">
</p>

### AI and agents

<p>
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" alt="PyTorch">
  <img src="https://img.shields.io/badge/LangGraph-1C3C3C?style=flat-square&logo=langchain&logoColor=white" alt="LangGraph">
  <img src="https://img.shields.io/badge/Temporal-141414?style=flat-square&logo=temporal&logoColor=white" alt="Temporal">
  <img src="https://img.shields.io/badge/MCP-18181B?style=flat-square&logo=anthropic&logoColor=white" alt="Model Context Protocol">
  <img src="https://img.shields.io/badge/LiteLLM-2563EB?style=flat-square&logo=python&logoColor=white" alt="LiteLLM">
  <img src="https://img.shields.io/badge/PydanticAI-E92063?style=flat-square&logo=pydantic&logoColor=white" alt="PydanticAI">
  <img src="https://img.shields.io/badge/Sentence_Transformers-FFD21E?style=flat-square&logo=huggingface&logoColor=black" alt="Sentence Transformers">
  <img src="https://img.shields.io/badge/spaCy-09A3D5?style=flat-square&logo=spacy&logoColor=white" alt="spaCy">
</p>

### Memory and retrieval

<p>
  <img src="https://img.shields.io/badge/Qdrant-DC244C?style=flat-square&logo=qdrant&logoColor=white" alt="Qdrant">
  <img src="https://img.shields.io/badge/FalkorDB-EA3A3A?style=flat-square&logo=redis&logoColor=white" alt="FalkorDB">
  <img src="https://img.shields.io/badge/pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="pgvector">
  <img src="https://img.shields.io/badge/Neo4j-4581C3?style=flat-square&logo=neo4j&logoColor=white" alt="Neo4j">
  <img src="https://img.shields.io/badge/Redis%20%2F%20Valkey-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis and Valkey">
</p>

### Backend, infrastructure, and data

<p>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white" alt="Kubernetes">
  <img src="https://img.shields.io/badge/OpenTelemetry-000000?style=flat-square&logo=opentelemetry&logoColor=white" alt="OpenTelemetry">
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white" alt="Prometheus">
  <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white" alt="Grafana">
  <img src="https://img.shields.io/badge/Nextflow-24B064?style=flat-square&logo=nextflow&logoColor=white" alt="Nextflow">
</p>

### Bioinformatics

<p>
  <img src="https://img.shields.io/badge/Scanpy-1F77B4?style=flat-square&logo=python&logoColor=white" alt="Scanpy">
  <img src="https://img.shields.io/badge/AnnData-EA4AAA?style=flat-square&logo=python&logoColor=white" alt="AnnData">
  <img src="https://img.shields.io/badge/pysam-3776AB?style=flat-square&logo=python&logoColor=white" alt="pysam">
  <img src="https://img.shields.io/badge/SAMtools-0B7261?style=flat-square&logo=linux&logoColor=white" alt="SAMtools">
  <img src="https://img.shields.io/badge/Bedtools-4C8CBF?style=flat-square&logo=linux&logoColor=white" alt="Bedtools">
  <img src="https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white" alt="Pandas">
  <img src="https://img.shields.io/badge/SciPy-8CAAE6?style=flat-square&logo=scipy&logoColor=white" alt="SciPy">
  <img src="https://img.shields.io/badge/scikit--learn-F7931E?style=flat-square&logo=scikitlearn&logoColor=white" alt="scikit-learn">
</p>

<img src="./assets/title-activity.svg" alt="GitHub activity" width="100%">

<p align="center"><sub>Generated from GitHub data and refreshed daily. Detailed breakdowns show only the activity GitHub exposes publicly.</sub></p>

<p align="center">
  <img src="./assets/analytics/activity-totals.svg" alt="All-time GitHub activity totals" width="100%">
  <img src="./assets/analytics/repository-languages.svg" alt="Primary languages across public repositories" width="100%">
</p>

<p align="center">
  <a href="mailto:amiramiritabat01@gmail.com"><img src="https://img.shields.io/badge/Email-18181B?style=for-the-badge&logo=gmail&logoColor=EA4335" alt="Email"></a>
  <a href="https://www.linkedin.com/in/amir-amiritabat-71190724b"><img src="https://img.shields.io/badge/LinkedIn-18181B?style=for-the-badge&logo=linkedin&logoColor=0A66C2" alt="LinkedIn"></a>
</p>

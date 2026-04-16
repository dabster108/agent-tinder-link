from pathlib import Path
from typing import Any, Dict, List

import yaml
from crewai import Agent, Crew, Process, Task
from crewai.agents.agent_builder.base_agent import BaseAgent
from crewai.project import CrewBase, agent, crew, task


@CrewBase
class AgentBackend:
    """Crew for SoulSync personality profiling."""

    agents: List[BaseAgent]
    tasks: List[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def personality_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["personality_agent"],
            verbose=True,
        )

    @agent
    def matching_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["matching_agent"],
            verbose=True,
        )

    @agent
    def conversation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["conversation_agent"],
            verbose=True,
        )

    @agent
    def evaluation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["evaluation_agent"],
            verbose=True,
        )

    @task
    def build_personality_profile(self) -> Task:
        return Task(
            config=self.tasks_config["build_personality_profile"],
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )


@CrewBase
class MatchingAgent:
    """Crew for matching one requesting user against candidate profiles."""

    agents: List[BaseAgent]
    tasks: List[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def personality_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["personality_agent"],
            verbose=True,
        )

    @agent
    def matching_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["matching_agent"],
            verbose=True,
        )

    @agent
    def conversation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["conversation_agent"],
            verbose=True,
        )

    @agent
    def evaluation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["evaluation_agent"],
            verbose=True,
        )

    @task
    def find_compatible_matches(self) -> Task:
        return Task(
            config=self.tasks_config["find_compatible_matches"],
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )


@CrewBase
class ConversationAgent:
    """Crew for simulated match conversation and evaluation."""

    agents: List[BaseAgent]
    tasks: List[Task]

    agents_config = "config/agents.yaml"
    tasks_config = "config/tasks.yaml"

    @agent
    def conversation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["conversation_agent"],
            verbose=True,
        )

    @agent
    def personality_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["personality_agent"],
            verbose=True,
        )

    @agent
    def matching_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["matching_agent"],
            verbose=True,
        )

    @agent
    def evaluation_agent(self) -> Agent:
        return Agent(
            config=self.agents_config["evaluation_agent"],
            verbose=True,
        )

    @task
    def load_conversation_context(self) -> Task:
        return Task(
            config=self.tasks_config["load_conversation_context"],
            agent=self.conversation_agent(),
        )

    @task
    def run_conversation_turn(self) -> Task:
        return Task(
            config=self.tasks_config["run_conversation_turn"],
            agent=self.conversation_agent(),
        )

    @task
    def evaluate_conversation_turn(self) -> Task:
        return Task(
            config=self.tasks_config["evaluate_conversation_turn"],
            agent=self.evaluation_agent(),
        )

    @task
    def produce_connection_verdict(self) -> Task:
        return Task(
            config=self.tasks_config["produce_connection_verdict"],
            agent=self.evaluation_agent(),
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )


def create_personality_crew() -> Crew:
    return AgentBackend().crew()


def create_matching_crew() -> Crew:
    return MatchingAgent().crew()


def _load_yaml_config(file_name: str) -> Dict[str, Any]:
    file_path = Path(__file__).resolve().parent / "config" / file_name
    if not file_path.exists() or not file_path.is_file():
        return {}

    try:
        parsed = yaml.safe_load(file_path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {}

    return parsed if isinstance(parsed, dict) else {}


def get_task_config(task_name: str) -> Dict[str, Any]:
    tasks = _load_yaml_config("tasks.yaml")
    task_config = tasks.get(task_name, {}) if isinstance(tasks, dict) else {}
    return task_config if isinstance(task_config, dict) else {}


def get_personality_agent_config() -> Dict[str, Any]:
    return _load_yaml_config("agents.yaml").get("personality_agent", {})


def get_conversation_agent_config() -> Dict[str, Any]:
    return _load_yaml_config("agents.yaml").get("conversation_agent", {})


def get_evaluation_agent_config() -> Dict[str, Any]:
    return _load_yaml_config("agents.yaml").get("evaluation_agent", {})


def create_conversation_crew() -> Crew:
    return ConversationAgent().crew()

from typing import Any, Dict, List

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

def create_personality_crew() -> Crew:
	return AgentBackend().crew()


def create_matching_crew() -> Crew:
	return MatchingAgent().crew()


def get_personality_agent_config() -> Dict[str, Any]:
	return AgentBackend().agents_config["personality_agent"]
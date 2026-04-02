import logging
import os

from crewai import Agent, Crew, Task, LLM, Process
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileWriterTool
from dotenv import load_dotenv

load_dotenv()


# ─────────────────────────────────────────────────────────────────────
# LLM Configuration
# Personality Agent gets the most capable model — nuanced understanding
# is the hardest job in the system.
# Matching Agent needs logical precision — same model is fine.
# Coach Agent needs warmth + speed — same model works.
# ─────────────────────────────────────────────────────────────────────

llm = LLM(
    model=os.getenv("MODEL"),
    temperature=0.7,    # Warm and human-feeling but grounded
    max_retries=3,
)

llm_matching = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.3,    # Lower temp for matching — we want precise, logical decisions
    max_retries=3,
)

llm_coach = LLM(
    model="groq/llama-3.3-70b-versatile",
    temperature=0.8,    # Slightly warmer for coaching — needs to feel human
    max_retries=3,
)


# ─────────────────────────────────────────────────────────────────────
# SoulSync Crew
# ─────────────────────────────────────────────────────────────────────

@CrewBase
class SoulSyncCrew():
    """
    SoulSync — AI-Powered Human Connection Platform.

    Three-agent system:

      1. Personality Agent  — Builds a deep psychological model of the user
                              over time. Acts like a world-class psychiatrist.
                              Learns from every conversation. Never stops growing.

      2. Matching Agent     — Receives personality briefs from two Personality
                              Agents and runs the 4-round negotiation protocol
                              to determine compatibility. Produces a match verdict
                              with a human-readable explanation.

      3. Coach Agent        — After a match is made, helps users have better
                              conversations. Suggests openers, watches tone,
                              nudges when energy drops, debriefs after each session.

    Flow:
      Personality Agent (User A) ──┐
                                    ├──► Matching Agent ──► Coach Agent
      Personality Agent (User B) ──┘
    """

    agents_config = 'config/agents.yaml'
    tasks_config  = 'config/tasks.yaml'

    # ── Agents ────────────────────────────────────────────────────────

    @agent
    def personality_agent(self) -> Agent:
        """
        The psychiatrist. Builds and maintains the user's personality model.
        Operates like a trusted friend who happens to be a world-class therapist.
        Runs every time the user opens the app and has a conversation.
        """
        return Agent(
            config=self.agents_config['personality_agent'],
            tools=[
                FileWriterTool(),   # Persist personality model updates to disk / DB layer
            ],
            inject_date=True,
            llm=llm,
            allow_delegation=False,     # Never delegates — deeply personal work
            max_iter=8,                 # Enough for a full session cycle
            max_rpm=1,
        )

    @agent
    def matching_agent(self) -> Agent:
        """
        The negotiator. Receives privacy-safe briefs from two Personality Agents
        and runs the 4-round structured negotiation protocol.
        Produces: Match/No Match verdict, confidence score, compatibility summary,
        and a human-readable explanation that both users see simultaneously.
        """
        return Agent(
            config=self.agents_config['matching_agent'],
            tools=[
                FileWriterTool(),   # Write match results and negotiation transcripts
            ],
            inject_date=True,
            llm=llm_matching,
            allow_delegation=False,
            max_iter=6,             # 4 negotiation rounds + setup + verdict
            max_rpm=1,
        )

    @agent
    def coach_agent(self) -> Agent:
        """
        The relationship coach. Activates after a successful match.
        Helps the matched users actually connect — suggests conversation starters,
        watches for energy drops, provides real-time nudges, and debriefs
        after every human-to-human chat session.
        """
        return Agent(
            config=self.agents_config['coach_agent'],
            tools=[
                FileWriterTool(),   # Save coaching notes, debrief summaries
            ],
            inject_date=True,
            llm=llm_coach,
            allow_delegation=False,
            max_iter=5,
            max_rpm=1,
        )

    # ── Tasks ─────────────────────────────────────────────────────────

    # ── PERSONALITY AGENT TASKS ───────────────────────────────────────

    @task
    def onboard_user(self) -> Task:
        """
        First session only. Runs the scenario game, hot takes, and passion
        monologue. Establishes the initial personality model. The user should
        leave this session feeling genuinely understood.
        """
        return Task(
            config=self.tasks_config['onboard_user'],
            agent=self.personality_agent(),
        )

    # @task
    # def run_personality_session(self) -> Task:
    #     """
    #     Every subsequent session. User opens the app, talks to their agent.
    #     Agent extracts signals, updates the model, and asks one curiosity
    #     question naturally if the moment is right.
    #     """
    #     return Task(
    #         config=self.tasks_config['run_personality_session'],
    #         agent=self.personality_agent(),
    #         context=[self.onboard_user()],
    #     )

    # @task
    # def generate_personality_brief(self) -> Task:
    #     """
    #     Called by the Orchestrator when this user is a match candidate.
    #     Produces a privacy-safe brief — interpreted patterns only,
    #     no raw quotes or working hypothesis.
    #     """
    #     return Task(
    #         config=self.tasks_config['generate_personality_brief'],
    #         agent=self.personality_agent(),
    #         context=[self.run_personality_session()],
    #         output_file='output/briefs/personality_brief.md',
    #     )

    # # ── MATCHING AGENT TASKS ──────────────────────────────────────────

    # @task
    # def run_negotiation_round_1(self) -> Task:
    #     """
    #     Round 1: Each agent submits a structured brief about their user.
    #     Interpreted summary only — values, communication style, life context,
    #     what they're looking for (stated and revealed), dealbreakers.
    #     """
    #     return Task(
    #         config=self.tasks_config['run_negotiation_round_1'],
    #         agent=self.matching_agent(),
    #         context=[self.generate_personality_brief()],
    #     )

    # @task
    # def run_negotiation_round_2(self) -> Task:
    #     """
    #     Round 2: Matching Agent identifies OVERLAPS (alignment points)
    #     and FLAGS (potential mismatches) between both briefs.
    #     Structured and specific — not vague impressions.
    #     """
    #     return Task(
    #         config=self.tasks_config['run_negotiation_round_2'],
    #         agent=self.matching_agent(),
    #         context=[self.run_negotiation_round_1()],
    #     )

    # @task
    # def run_negotiation_round_3(self) -> Task:
    #     """
    #     Round 3: Attempt to resolve each flag using deeper profile evidence.
    #     Unresolvable flags stay flagged and are surfaced to both users.
    #     """
    #     return Task(
    #         config=self.tasks_config['run_negotiation_round_3'],
    #         agent=self.matching_agent(),
    #         context=[self.run_negotiation_round_2()],
    #     )

    # @task
    # def produce_match_verdict(self) -> Task:
    #     """
    #     Round 4: Final verdict.
    #     Produces: Match / No Match / Maybe, confidence score 0-100,
    #     top 3 compatibility reasons, top 2 things to be aware of.
    #     This becomes the user-facing summary both users see simultaneously.
    #     """
    #     return Task(
    #         config=self.tasks_config['produce_match_verdict'],
    #         agent=self.matching_agent(),
    #         context=[self.run_negotiation_round_3()],
    #         output_file='output/matches/match_verdict.md',
    #     )

    # # ── COACH AGENT TASKS ─────────────────────────────────────────────

    # @task
    # def generate_conversation_starters(self) -> Task:
    #     """
    #     Immediately after a match is confirmed. Coach generates 5 personalized
    #     conversation openers based on both personality briefs — not generic,
    #     not corny. Drawn from actual shared interests and complementary traits.
    #     """
    #     return Task(
    #         config=self.tasks_config['generate_conversation_starters'],
    #         agent=self.coach_agent(),
    #         context=[self.produce_match_verdict()],
    #     )

    # @task
    # def monitor_conversation_health(self) -> Task:
    #     """
    #     Runs periodically during an active human-to-human chat.
    #     Watches for: energy drops, topic exhaustion, miscommunication signals.
    #     Produces private nudges for each user — never visible to their match.
    #     """
    #     return Task(
    #         config=self.tasks_config['monitor_conversation_health'],
    #         agent=self.coach_agent(),
    #         context=[self.generate_conversation_starters()],
    #     )

    # @task
    # def run_post_chat_debrief(self) -> Task:
    #     """
    #     Triggers after every human-to-human chat session ends.
    #     Coach asks how it went, collects a rating + optional reflection,
    #     and feeds the insights back to the Personality Agent to refine
    #     the user's model. This closes the learning loop.
    #     """
    #     return Task(
    #         config=self.tasks_config['run_post_chat_debrief'],
    #         agent=self.coach_agent(),
    #         context=[self.monitor_conversation_health()],
    #         output_file='output/coaching/debrief_summary.md',
    #     )

    # ── Crew ──────────────────────────────────────────────────────────

    @crew
    def soulsync_crew(self) -> Crew:
        """
        The full SoulSync agent system.

        Sequential process:
          Personality session → Brief generation → 4-round negotiation
          → Match verdict → Coaching starters → Live monitoring → Debrief

        In production you'll run sub-crews for specific flows
        (e.g. just the personality session, or just the coaching loop)
        rather than the full pipeline every time.
        """
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
            planning=False,     # Agents follow defined task order
            max_rpm=1,
        )
# Local dev entry points. The app itself runs through expo (npm run ios/android); what
# lives here is the Catalan migration tooling, which is plain Node with no install step.

PORT ?= 4848
PANEL := migration-to-saints/webui/server.js

REVIEW := migration-to-saints/review
REVIEW_RUN := $(REVIEW)/run

.PHONY: run-panel stop-panel day-check review help

help:
	@echo "make run-panel [PORT=4848]   Panell de migració (si el port és ocupat, en proposa un altre)"
	@echo "make stop-panel [PORT=4848]  Atura el panell"
	@echo "make day-check DATE=2026-08-12   El mateix informe d'un dia, per terminal"
	@echo "make review DATES=2026-08-20,2026-08-21   Revisió dia a dia contra saints-app"

# The full review, end to end. Read-only: it never touches cpl-app.db and never commits —
# corrections come out as prompts to run elsewhere (see .claude/skills/revisio-dia).
#
# Note it uses review/resolve-cpl-days.test.js, NOT migration-to-saints/cpl-day.test.js:
# the latter's Vespers ferial control is the rendered Vespers object itself, which marks
# every field ferial and invents false divergences on memorials.
review:
	@test -n "$(DATES)" || (echo "Cal una llista de dates: make review DATES=2026-08-20,2026-08-21" && exit 1)
	@mkdir -p $(REVIEW_RUN)
	DATES=$(DATES) DIOCESE=$(or $(DIOCESE),Barcelona) OUT=$(REVIEW_RUN)/cpl-days.json \
		npx jest $(REVIEW)/resolve-cpl-days.test.js --silent
	DATES=$(DATES) node $(REVIEW)/build-rows.js
	node $(REVIEW)/commons-proposal.js
	node $(REVIEW)/build-report.js

# If the port is taken, offer the next free one instead of deciding on your behalf: the
# squatter may be a panel you still want, or something else entirely. Saying no falls back
# to the old behaviour (free the port and restart there), so a plain reload is still two
# keystrokes. Without a terminal to ask (CI, pipes) it goes straight to that fallback.
run-panel:
	@port=$(PORT); \
	if lsof -ti tcp:$$port -sTCP:LISTEN >/dev/null 2>&1; then \
		free=; p=$$port; \
		for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do \
			p=$$((p + 1)); \
			lsof -ti tcp:$$p -sTCP:LISTEN >/dev/null 2>&1 || { free=$$p; break; }; \
		done; \
		if [ -z "$$free" ]; then \
			echo "Port $$port ocupat i cap port lliure entre $$((port + 1)) i $$((port + 20))."; \
			exit 1; \
		fi; \
		ans=n; \
		if [ -r /dev/tty ]; then \
			printf "Port %s ocupat. Engego el panell al %s? [S/n] " "$$port" "$$free"; \
			read ans < /dev/tty || ans=s; \
		fi; \
		case "$$ans" in \
			""|s|S|si|Si|SI|sí|Sí|y|Y|yes) port=$$free ;; \
			*) $(MAKE) --no-print-directory stop-panel PORT=$$port ;; \
		esac; \
	fi; \
	exec node $(PANEL) $$port

stop-panel:
	@pids=$$(lsof -ti tcp:$(PORT) -sTCP:LISTEN 2>/dev/null); \
	if [ -n "$$pids" ]; then \
		echo "Aturant el panell del port $(PORT) (pid $$pids)"; \
		kill $$pids 2>/dev/null || true; \
		for i in 1 2 3 4 5 6 7 8 9 10; do \
			lsof -ti tcp:$(PORT) -sTCP:LISTEN >/dev/null 2>&1 || break; \
			sleep 0.3; \
		done; \
	fi

day-check:
	@test -n "$(DATE)" || (echo "Cal una data: make day-check DATE=2026-08-12" && exit 1)
	node migration-to-saints/day-check.js $(DATE)

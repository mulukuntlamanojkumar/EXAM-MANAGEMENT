import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Modal } from '../../components/common/Modal';
import { 
  Clock, 
  Flag, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  CheckCircle, 
  AlertTriangle, 
  Send,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

export const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  // Exam state
  const [examData, setExamData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: { selectedOptions: [], textAnswer: '', flagged: false } }
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saving' | 'saved'

  // Anti-cheat proctoring state
  const [warningToast, setWarningToast] = useState(null);
  const [proctorCount, setProctorCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Submit confirmation modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // 1. Initialize & Start Exam Session
  useEffect(() => {
    const initExam = async () => {
      try {
        const res = await api.post(`/student/exams/${examId}/start`);
        const data = res.data;
        setExamData(data);
        setRemainingSeconds(data.remainingSeconds);
        setProctorCount(data.proctorWarningsCount || 0);

        // Preload saved answers if resuming session
        if (data.savedAnswers) {
          const map = {};
          Object.entries(data.savedAnswers).forEach(([qId, ans]) => {
            map[qId] = {
              selectedOptions: ans.selectedOptions || [],
              textAnswer: ans.textAnswer || '',
              flagged: ans.flagged || false,
            };
          });
          setAnswers(map);
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to start examination');
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examId, navigate]);

  // 2. Countdown Timer
  useEffect(() => {
    if (remainingSeconds === null) return;

    if (remainingSeconds <= 0) {
      handleFinalSubmit(true);
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // 3. Proctoring / Tab Switch Detection
  useEffect(() => {
    if (!examData) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportProctorEvent('TAB_SWITCH', 'Candidate switched browser tab or minimized window');
      }
    };

    const handleWindowBlur = () => {
      reportProctorEvent('WINDOW_BLUR', 'Browser window lost focus');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examData]);

  const reportProctorEvent = async (type, details) => {
    if (!examData) return;
    setProctorCount((prev) => prev + 1);
    setWarningToast(`⚠️ Proctor Warning: Focus lost / Tab switched! This incident has been logged.`);

    try {
      await api.post(`/student/submissions/${examData.submissionId}/proctor`, {
        eventType: type,
        details,
      });
    } catch (err) {
      // silent
    }

    setTimeout(() => {
      setWarningToast(null);
    }, 6000);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Auto-Save Individual Answer
  const saveAnswerToBackend = async (questionId, newAnswer) => {
    if (!examData) return;
    setSaveStatus('saving');
    try {
      await api.post(`/student/submissions/${examData.submissionId}/answer`, {
        questionId,
        selectedOptions: newAnswer.selectedOptions || [],
        textAnswer: newAnswer.textAnswer || '',
        flagged: newAnswer.flagged || false,
      });
      setSaveStatus('saved');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  // Handlers for student answer input
  const currentQuestion = examData?.questions?.[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] || { selectedOptions: [], textAnswer: '', flagged: false } : null;

  const handleSelectOption = (option) => {
    if (!currentQuestion) return;
    let newOptions = [];

    if (currentQuestion.type === 'MCQ_MULTIPLE') {
      const exists = currentAnswer.selectedOptions.includes(option);
      newOptions = exists
        ? currentAnswer.selectedOptions.filter((o) => o !== option)
        : [...currentAnswer.selectedOptions, option];
    } else {
      newOptions = [option];
    }

    const updated = {
      ...currentAnswer,
      selectedOptions: newOptions,
    };

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    saveAnswerToBackend(currentQuestion.id, updated);
  };

  const handleTextAnswerChange = (text) => {
    if (!currentQuestion) return;
    const updated = {
      ...currentAnswer,
      textAnswer: text,
    };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    saveAnswerToBackend(currentQuestion.id, updated);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const updated = {
      ...currentAnswer,
      flagged: !currentAnswer.flagged,
    };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    saveAnswerToBackend(currentQuestion.id, updated);
  };

  const handleClearAnswer = () => {
    if (!currentQuestion) return;
    const updated = {
      ...currentAnswer,
      selectedOptions: [],
      textAnswer: '',
    };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: updated }));
    saveAnswerToBackend(currentQuestion.id, updated);
  };

  // Final Submit Exam
  const handleFinalSubmit = async (autoSubmitted = false) => {
    if (submitting) return;
    setSubmitting(true);
    setConfirmModalOpen(false);

    try {
      // Build final submit payload
      const formattedAnswers = {};
      Object.entries(answers).forEach(([qId, ans]) => {
        formattedAnswers[qId] = {
          questionId: qId,
          selectedOptions: ans.selectedOptions || [],
          textAnswer: ans.textAnswer || '',
          flagged: ans.flagged || false,
        };
      });

      const res = await api.post(`/student/submissions/${examData.submissionId}/submit`, {
        answers: formattedAnswers,
      });

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      navigate(`/student/result/${examData.submissionId}`);
    } catch (err) {
      alert('Error submitting examination. Please check connection and try again.');
      setSubmitting(false);
    }
  };

  if (loading || !examData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-lg font-bold">Securing Test Environment...</h2>
          <p className="text-xs text-slate-400">Loading sanitized questions and initiating session proctoring.</p>
        </div>
      </div>
    );
  }

  // Formatting Timer
  const formatTime = (secs) => {
    if (secs === null || secs < 0) return '00:00';
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}:${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Palette metrics calculation
  const totalQuestions = examData.questions.length;
  let answeredCount = 0;
  let flaggedCount = 0;

  examData.questions.forEach((q) => {
    const ans = answers[q.id];
    const isAnswered = ans && (ans.selectedOptions?.length > 0 || ans.textAnswer?.trim());
    if (isAnswered) answeredCount++;
    if (ans?.flagged) flaggedCount++;
  });

  const unansweredCount = totalQuestions - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans select-none">
      {/* Anti-cheat Alert Banner */}
      {warningToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold animate-bounce">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{warningToast}</span>
        </div>
      )}

      {/* Top Test Banner Header */}
      <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            Q{currentIndex + 1}
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              {examData.examTitle}
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">Paper Code: {examData.examCode}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          {/* Save Status Indicator */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            {saveStatus === 'saving' ? (
              <span className="flex items-center gap-1 text-amber-500 animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle className="w-3.5 h-3.5" /> Answers Synced
              </span>
            )}
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border ${
              remainingSeconds < 300
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTime(remainingSeconds)}</span>
          </div>

          {/* Submit Test CTA */}
          <button
            onClick={() => setConfirmModalOpen(true)}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Finish & Submit
          </button>
        </div>
      </header>

      {/* Main Testing View */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Question Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-between">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  +{currentQuestion?.marks} marks
                </span>
                {currentQuestion?.negativeMarks > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-mono">
                    -{currentQuestion?.negativeMarks} penalty
                  </span>
                )}
              </div>
            </div>

            {/* Question Prompt */}
            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion?.title}
            </div>

            {/* Options Body */}
            <div className="mt-6 space-y-3">
              {/* MCQ Single / True False */}
              {(currentQuestion?.type === 'MCQ_SINGLE' || currentQuestion?.type === 'TRUE_FALSE') && (
                <div className="space-y-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = currentAnswer?.selectedOptions?.includes(opt);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-indigo-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="font-medium">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MCQ Multiple */}
              {currentQuestion?.type === 'MCQ_MULTIPLE' && (
                <div className="space-y-2.5">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-2">
                    (Multiple options may be selected)
                  </p>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected = currentAnswer?.selectedOptions?.includes(opt);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        className={`flex items-center gap-3.5 p-4 rounded-2xl border text-sm cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-sm dark:bg-indigo-950/50 dark:border-indigo-500 dark:text-indigo-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-medium">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {currentQuestion?.type === 'SHORT_ANSWER' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Type your concise response:
                  </label>
                  <input
                    type="text"
                    value={currentAnswer?.textAnswer || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    placeholder="Enter answer here..."
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Descriptive Essay */}
              {currentQuestion?.type === 'DESCRIPTIVE' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Detailed Explanation / Essay Answer:
                  </label>
                  <textarea
                    rows={6}
                    value={currentAnswer?.textAnswer || ''}
                    onChange={(e) => handleTextAnswerChange(e.target.value)}
                    placeholder="Type your comprehensive solution..."
                    className="w-full p-4 text-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions Bar */}
          <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                  currentAnswer?.flagged
                    ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                <Flag className="w-4 h-4 text-amber-500" />
                {currentAnswer?.flagged ? 'Flagged' : 'Flag for Review'}
              </button>

              <button
                type="button"
                onClick={handleClearAnswer}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl"
              >
                Clear Response
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((idx) => idx - 1)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                type="button"
                disabled={currentIndex === totalQuestions - 1}
                onClick={() => setCurrentIndex((idx) => idx + 1)}
                className="flex items-center gap-1 px-5 py-2 text-xs font-bold rounded-xl text-white bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-700 shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right Palette Drawer */}
        <aside className="w-full lg:w-72 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0">
          <div>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Question Navigator
            </h3>

            {/* Questions Grid */}
            <div className="grid grid-cols-5 gap-2 max-h-72 lg:max-h-96 overflow-y-auto pr-1">
              {examData.questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = ans && (ans.selectedOptions?.length > 0 || ans.textAnswer?.trim());
                const isFlagged = ans?.flagged;
                const isCurrent = currentIndex === idx;

                let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                if (isAnswered && isFlagged) {
                  btnClass = 'bg-purple-500 text-white shadow-xs';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-500 text-white shadow-xs';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-500 text-white shadow-xs';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${btnClass} ${
                      isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Color Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-400">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-400">Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Flagged for Review ({flaggedCount})</span>
              </div>
            </div>
          </div>

          {/* Proctoring notice */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Active Proctoring: </span>
            {proctorCount} blur/tab events detected
          </div>
        </aside>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Finalize & Submit Examination"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to conclude your examination? Once submitted, your answers will be automatically evaluated and scored.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-500">Answered Questions:</span>
              <span className="text-emerald-600">{answeredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unanswered Questions:</span>
              <span className="text-rose-600">{unansweredCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Flagged Questions:</span>
              <span className="text-amber-600">{flaggedCount}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              Continue Test
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleFinalSubmit(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
            >
              {submitting ? 'Submitting...' : 'Yes, Submit Exam'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

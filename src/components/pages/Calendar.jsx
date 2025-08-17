import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { calendarService } from "@/services/api/calendarService";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const currentUser = {
    name: "Nathan Garrett"
  };

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await calendarService.getByMonth(
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowAddEvent(true);
  };

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !selectedDate) return;

    try {
      setSaving(true);
      const eventData = {
        title: newEventTitle.trim(),
        date: format(selectedDate, 'yyyy-MM-dd'),
        createdBy: currentUser.name,
        type: 'team-event'
      };

      const newEvent = await calendarService.create(eventData);
      setEvents([...events, newEvent]);
      setNewEventTitle("");
      setShowAddEvent(false);
      setSelectedDate(null);
      toast.success("Event added successfully!");
    } catch (err) {
      toast.error("Failed to add event. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddEvent(false);
    setSelectedDate(null);
    setNewEventTitle("");
  };

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'holiday':
        return 'bg-accent text-white';
      case 'team-event':
        return 'bg-primary text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add padding days to start from Sunday
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadEvents} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-warning to-yellow-500 rounded-xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 font-display">Team Calendar</h1>
              <p className="text-yellow-100">Keep track of holidays and team events</p>
            </div>
            <div className="hidden md:block">
              <ApperIcon name="Calendar" size={48} className="text-yellow-200" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Calendar Controls */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handlePrevMonth}>
              <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold font-display">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <Button variant="outline" onClick={handleNextMonth}>
              <ApperIcon name="ChevronRight" className="w-4 h-4" />
            </Button>
          </div>
          
          <Button onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-gray-600 bg-gray-50 rounded-t">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isTodayDate = isToday(date);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => isCurrentMonth && handleDateClick(date)}
                className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-100 text-gray-400' : ''
                } ${isTodayDate ? 'bg-primary/5 border-primary/30' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isTodayDate ? 'text-primary font-bold' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                  {isTodayDate && (
                    <div className="w-2 h-2 bg-primary rounded-full inline-block ml-1"></div>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.Id}
                      className={`text-xs px-2 py-1 rounded truncate ${getEventTypeColor(event.type)}`}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Add Event Modal */}
      {showAddEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCancelAdd}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-display">Add Event</h3>
              <button
                onClick={handleCancelAdd}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="p-2 bg-gray-50 rounded border">
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <Input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Enter event title..."
                  autoFocus
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddEvent}
                  disabled={!newEventTitle.trim() || saving}
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                      Add Event
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleCancelAdd}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Legend */}
      <Card className="p-4">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-accent rounded"></div>
            <span className="text-sm text-gray-600">Holidays</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm text-gray-600">Team Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary/20 border-2 border-primary rounded"></div>
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Calendar;
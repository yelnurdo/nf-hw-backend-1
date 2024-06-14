import mongoose from 'mongoose';
import { CreateEventDto } from './dtos/CreateEvent.dot';
import EventModel, { IEvent } from './models/Event';
import { Event } from './types/response';
import { SortOrder } from 'mongoose';



// this event service instance shows how to create a event, get a event by id, and get all events with in-memory data
class EventService {
  
    async getEventById(id: string): Promise<IEvent | null> {
      return await EventModel.findById(id).exec();
    }

    async getEvents(): Promise<IEvent[]> {
      return await EventModel.find().exec(); 
    }

    async createEvent(createEventDto: CreateEventDto): Promise<IEvent> {
      const { name, description, date, location ,duration} = createEventDto;
      const newEvent = new EventModel({
        name,
        description,
        date: new Date(date),
        location,
        duration
      });
  
      await newEvent.save();
      return newEvent;
    }
  
    async getEventsByCity(
      city: string,
      page: number = 1,
      limit: number = 10,
      sortBy: string = 'date',
      sortDirection: string = 'asc'
    ): Promise<IEvent[]> {
      const sortOptions: { [key: string]: SortOrder } = {};
      sortOptions[sortBy] = sortDirection === 'desc' ? -1 : 1;
    
      const events = await EventModel.find({ location: city })
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    
      return events;
    }
    
    
  }
  
  export default EventService;
  
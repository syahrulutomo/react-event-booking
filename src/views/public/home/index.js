import React, { useState, useEffect, memo } from 'react';
import {
  PublicBanner, LayoutDefault, ContainerDefault, PartialPublicHeader, PublicEventList, CategoryList, Category,
} from '@/components';
import Event from '@/components/features/event';
import PublicSearchBar from '@/components/features/public-search-bar';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { fetchNearestEventList } from '@/services/redux/actions/event';
import { fetchCategoryList, fetchCategoryByName } from '@/services/redux/actions/category';
import moment from 'moment';

const HomeView = memo((props) => {
  const {
    selectedCity, onFetchNearestEventList, onFetchCategoryList, categories, nearestEvents,
  } = props;

  const [mappedTechEvents, setMappedTechEvents] = useState([]);
  const [mappedFilmEvents, setMappedFilmEvents] = useState([]);
  const [mappedNearestEvents, setMappedNearestEvents] = useState([]);
  const [mappedCategories, setMappedCategories] = useState([]);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  useEffect(() => {
    if (selectedCity._id !== undefined) {
      onFetchNearestEventList(selectedCity.location.coordinates[1], selectedCity.location.coordinates[0]);
    }
  }, [selectedCity]);

  useEffect(() => {
    onFetchCategoryList();
  }, []);

  const mapToEventList = (data, setter) => {
    if (data.length > 0) {
      const evts = data.map((e) => {
        const formattedDate = moment(e.date).format('MMM DD');
        const day = moment(e.date).day();
        return (
          <li key={e._id}>
            <Event
              id={e._id}
              thumbnail={e.photos[e.photos.length - 1]}
              alt={e.title}
              date={`${daysOfWeek[day]}, ${formattedDate.toLocaleUpperCase()}`}
              title={e.title}
              groupName={e.groupHost.name}
              attendees={e.attendees}
            />
          </li>
        );
      });
      setter(evts);
    }
  };

  const mapToCategoryList = (data, setter) => {
    if (data.length > 0) {
      const c = data.map((e) => {
        return (
          <Category
            key={e._id}
            id={e._id}
            thumbnail={e.photo}
            alt={e.name}
            title={e.name}
          />
        );
      });
      setter(c);
    }
  };

  useEffect(() => {
    mapToEventList(nearestEvents, setMappedNearestEvents);
  }, [nearestEvents]);

  useEffect(() => {
    if (mappedTechEvents.length === 0) {
      if (categories.length > 0) {
        const t = categories.find((c) => c.name === 'Tech').events;
        mapToEventList(t, setMappedTechEvents);
      }
    }
  }, [mappedTechEvents, categories]);

  useEffect(() => {
    if (mappedTechEvents.length === 0) {
      if (categories.length > 0) {
        const f = categories.find((c) => c.name === 'Film').events;
        mapToEventList(f, setMappedFilmEvents);
      }
    }
  }, [mappedTechEvents, categories]);

  useEffect(() => {
    if (mappedCategories.length === 0) {
      if (categories.length > 0) {
        mapToCategoryList(categories, setMappedCategories);
      }
    }
  }, [mappedCategories, categories]);

  const city = selectedCity._id !== undefined ? `Event near ${selectedCity.name}, ${selectedCity.countryAbbr} ` : 'Event near you';

  return (
    <LayoutDefault>
      <PartialPublicHeader />
      <ContainerDefault>
        <PublicBanner />
        <PublicSearchBar />
        {
          mappedNearestEvents.length > 0
            ? <PublicEventList title={city} events={mappedNearestEvents} />
            : ''
        }
        {
          mappedTechEvents.length > 0
            ? <PublicEventList title="Tech" events={mappedTechEvents} />
            : ''
        }
        {
          mappedFilmEvents.length > 0
            ? <PublicEventList title="Film" events={mappedFilmEvents} />
            : ''
        }
        <CategoryList categories={mappedCategories} title="Browse events by category" />
      </ContainerDefault>
    </LayoutDefault>
  );
});

HomeView.propTypes = {
  nearestCity: PropTypes.array,
  selectedCity: PropTypes.object,
  onFetchNearestEventList: PropTypes.func.isRequired,
  onFetchCategoryList: PropTypes.func.isRequired,
  onFetchCategoryByName: PropTypes.func.isRequired,
  categories: PropTypes.array,
  nearestEvents: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    nearestCity: state.city.nearest,
    selectedCity: state.city.selected,
    nearestEvents: state.event.nearestEvents,
    categories: state.category.categories,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onFetchNearestEventList: (latitude, longitude) => dispatch(fetchNearestEventList(latitude, longitude)),
    onFetchCategoryList: () => dispatch(fetchCategoryList()),
    onFetchCategoryByName: (name) => dispatch(fetchCategoryByName(name)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeView);

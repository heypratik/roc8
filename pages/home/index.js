import React, { useEffect, useState } from 'react';

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [emails, setEmails] = useState(null);
  const [allEmails, setAllEmails] = useState([]);
  const [emailBody, setEmailBody] = useState(null);
  const [cache, setCache] = useState({});
  const [activeFilter, setActiveFilter] = useState('unread');
  const [readEmails, setReadEmails] = useState(
    typeof window !== 'undefined' && localStorage.getItem("readEmails")
      ? JSON.parse(localStorage.getItem('readEmails'))
      : []
  );
  const [favEmails, setFavEmails] = useState(
    typeof window !== 'undefined' && localStorage.getItem("favEmails")
      ? JSON.parse(localStorage.getItem('favEmails'))
      : []
  );
  const [totalPages, setTotalPages] = useState(1);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setSelectedEmail(null);
    }
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      try {
        const res = await fetch(`https://flipkart-email-mock.vercel.app/?page=${currentPage + 1}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error('Failed to fetch next page');

        const data = await res.json();
        setCurrentPage(currentPage + 1);
        setEmails(data);
        setAllEmails(prevEmails => {
          const newEmails = data.list.filter(newEmail => 
            !prevEmails.some(existingEmail => existingEmail.id === newEmail.id)
          );
          return [...prevEmails, ...newEmails];
        });
        setSelectedEmail(null);
      } catch (error) {
        alert('Failed to fetch next page. Server Error.');
        console.error(error);
      }
    }
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setSelectedEmail(null);
    setCurrentPage(1);
  };

  useEffect(() => {
    async function fetchAllEmails() {
      if (cache[`page_${currentPage}`]) {
        setEmails(cache[`page_${currentPage}`]);
        setAllEmails(prevEmails => {
          const newEmails = cache[`page_${currentPage}`].list.filter(newEmail => 
            !prevEmails.some(existingEmail => existingEmail.id === newEmail.id)
          );
          return [...prevEmails, ...newEmails];
        });
        setTotalPages(Math.ceil(cache[`page_${currentPage}`].total));
      } else {
        try {
          const res = await fetch(`https://flipkart-email-mock.vercel.app/?page=${currentPage}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!res.ok) throw new Error('Failed to fetch emails');

          const data = await res.json();
          setEmails(data);
          setAllEmails(prevEmails => {
            const newEmails = data.list.filter(newEmail => 
              !prevEmails.some(existingEmail => existingEmail.id === newEmail.id)
            );
            return [...prevEmails, ...newEmails];
          });
          setTotalPages(data.total);
          setCache((prevCache) => ({ ...prevCache, [`page_${currentPage}`]: data }));
        } catch (error) {
          alert('Failed to fetch emails. Server Error.');
          console.error(error);
        }
      }
    }

    fetchAllEmails();
  }, [currentPage]);

  useEffect(() => {
    async function getEmailBody() {
      if (cache[`email_${selectedEmail}`]) {
        setEmailBody(cache[`email_${selectedEmail}`]);
      } else {
        try {
          const emailData = await fetch(`https://flipkart-email-mock.vercel.app/?id=${selectedEmail}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!emailData.ok) throw new Error('Failed to fetch email body');

          const data = await emailData.json();
          setEmailBody(data.body);
          setCache((prevCache) => ({ ...prevCache, [`email_${selectedEmail}`]: data.body }));
        } catch (error) {
          alert('Failed to fetch email content. Please try again.');
          console.error(error);
        }
      }
    }

    if (selectedEmail) {
      getEmailBody();
      if (!readEmails.includes(selectedEmail)) {
        const updatedReadEmails = [...readEmails, selectedEmail];
        setReadEmails(updatedReadEmails);
        if (typeof window !== 'undefined') {
          localStorage.setItem('readEmails', JSON.stringify(updatedReadEmails));
        }
        if (activeFilter === 'unread') {
          setActiveFilter('read');
        }
      }
    }
  }, [selectedEmail, readEmails, activeFilter]);

  const handlePrefetchEmail = async (emailId) => {
    if (!cache[`email_${emailId}`]) {
      try {
        const emailData = await fetch(`https://flipkart-email-mock.vercel.app/?id=${emailId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!emailData.ok) throw new Error('Failed to prefetch email');

        const data = await emailData.json();
        setCache((prevCache) => ({ ...prevCache, [`email_${emailId}`]: data.body }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleFavorite = (emailId) => {
    let updatedFavEmails;
    if (favEmails.includes(emailId)) {
      updatedFavEmails = favEmails.filter((id) => id !== emailId);
    } else {
      updatedFavEmails = [...favEmails, emailId];
    }
    
    setFavEmails(updatedFavEmails);
    if (typeof window !== 'undefined') {
      localStorage.setItem('favEmails', JSON.stringify(updatedFavEmails));
    }
  };

  const getFilteredEmails = () => {
    if (!allEmails.length) return [];
    
    switch (activeFilter) {
      case 'read':
        return allEmails
          .filter(email => readEmails.includes(email.id))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
      case 'unread':
        return emails ? emails.list.filter(email => !readEmails.includes(email.id)) : [];
      case 'favorites':
        return allEmails.filter(email => favEmails.includes(email.id));
      default:
        return emails ? emails.list : [];
    }
  };

  const filteredEmails = getFilteredEmails();

  return (
    <main className='flex flex-col items-start justify-start gap-4 p-2 md:p-10 bg-[#f4f5f9] min-h-screen'>
      <div className='w-full flex gap-4 mb-4 items-center flex-col md:flex-row'>
      <p className='text-[#000]'>Filter by: </p>
        <button
          onClick={() => handleFilterChange('unread')}
          className={`px-4 py-2 rounded-full ${activeFilter === 'unread' ? 'bg-[#e1e4ea] text-[#636363] border border-[#cfd2dc]' : 'bg-[#f4f5f9] text-[#000]'}`}
        >
          Unread
        </button>
        <button
          onClick={() => handleFilterChange('read')}
          className={`px-4 py-2 rounded-full ${activeFilter === 'read' ? 'bg-[#e1e4ea] text-[#636363] border border-[#cfd2dc]' : 'bg-[#f4f5f9] text-[#000]'}`}
        >
          Read
        </button>
        <button
          onClick={() => handleFilterChange('favorites')}
          className={`px-4 py-2 rounded-full ${activeFilter === 'favorites' ? 'bg-[#e1e4ea] text-[#636363] border border-[#cfd2dc]' : 'bg-[#f4f5f9] text-[#000]'}`}
        >
          Favorites
        </button>
      </div>
      <div className='w-full flex items-start justify-center gap-4 md:flex-row flex-col'>
        <section className={`w-full md:w-1/3 ${selectedEmail == null && "!w-full"} flex flex-col gap-4 max-h-[90vh] no-scrollbar overflow-y-scroll`}>
          {filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email.id)}
              onMouseEnter={() => handlePrefetchEmail(email.id)}
              className={`email cursor-pointer w-full bg-white flex flex-col md:flex-row items-start p-5 border border-[#cfd2dc] 
                ${selectedEmail === email.id && '!border-[#E54065]'} 
                ${readEmails.includes(email.id) ? 'bg-[#f2f2f2]' : 'bg-white'} 
                rounded-md`}
            >
              <div className='mr-4 flex items-start'>
                <span className='bg-[#e54065] text-white font-bold w-[60px] h-[60px] rounded-full flex items-center justify-center'>
                  {email.from.name[0].toUpperCase()}
                </span>
              </div>
              <div className='flex flex-col w-full md:w-5/6'>
                <p className='text-[#636363]'>
                  From: <span className='font-bold'>{email.from.name}</span> <span className='font-bold'>{`<${email.from.email}>`}</span>
                </p>
                <p className='text-[#636363]'>
                  Subject: <span className='font-bold'>{email.subject}</span>
                </p>
                <div className='mt-4'>
                  <p className='text-[#636363]'>{email.short_description}</p>
                  <div className='flex gap-4 items-center mt-4'>
                    <p className='text-[#636363]'>{new Date(email.date).toLocaleDateString('en-GB')}</p>
                    <p className='text-[#e54065] font-bold'>{favEmails.includes(email.id) ? 'Favorite' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activeFilter === 'unread' && (
            <div className='w-full flex justify-between items-center mt-4 p-4 bg-white rounded-md'>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md ${currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-[#e54065] text-white'}`}
              >
                Previous
              </button>
              <span className='text-[#636363]'>Page {currentPage} of {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md ${currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-[#e54065] text-white'}`}
              >
                Next
              </button>
            </div>
          )}
        </section>
        {selectedEmail && <aside className='bg-white text-black p-5 rounded-md w-full md:w-2/3 min-h-[90vh] border border-[#cfd2dc]'>
          <section>
            {emailBody && (
              <div className='flex flex-col gap-4'>
                <div className='w-full flex items-start gap-4 flex-col md:flex-row'>
                  <span className='bg-[#e54065] text-white font-bold w-[60px] h-[60px] rounded-full flex items-center justify-center'>
                    {allEmails.find((email) => email.id === selectedEmail)?.from.name[0].toUpperCase()}
                  </span>
                  <div className='flex items-start justify-between w-full flex-col md:flex-row'>
                    <div>
                      <h2 className='font-bold text-4xl text-[#636363]'>
                        {allEmails.find((email) => email.id === selectedEmail)?.subject}
                      </h2>
                      <p className='mt-2 md:mt-5 mb-5 text-[#636363]'>
                        {new Date(allEmails.find((email) => email.id === selectedEmail)?.date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleFavorite(selectedEmail)}
                      className='border p-2 rounded-full text-white px-4 bg-[#e54065]'
                    >
                      {favEmails.includes(selectedEmail) ? 'Unmark Favorite' : 'Mark as Favorite'}
                    </button>
                  </div>
                </div>
                <div className='w-full embody text-[#636363]' dangerouslySetInnerHTML={{ __html: emailBody }} />
              </div>
            )}
          </section>
        </aside>}
      </div>
    </main>
  );
};

export default Home;
const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
const search = `                    country={selectedCountry}
                  />
                  </motion.div>
                    <FlightPriceTracker globalCountry={globalCountry} onTriggerToast={triggerToast} />
                  </motion.div>
                )}
`;
const replacement = `                    country={selectedCountry}
                  />
                  </motion.div>
                )}

                {/* TAB CONTENT: Flight Price Tracker */}
                {studentTab === 'flight' && (
                  <motion.div key="flight" initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -20}} transition={{ duration: 0.3 }}>
                    <FlightPriceTracker globalCountry={globalCountry} onTriggerToast={triggerToast} />
                  </motion.div>
                )}
`;
c = c.replace(search, replacement);
fs.writeFileSync('src/App.tsx', c);

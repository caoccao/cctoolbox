/*
 * Copyright (c) 2024. caoccao.com Sam Cao
 * All rights reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 * http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

use chrono::{DateTime, Local};
use clap::Parser;
use std::{ops::Sub, time::Duration};
use windows::Win32::System::SystemInformation::GetTickCount64;

#[derive(Parser, Debug)]
#[command(version, about, long_about=None)]
#[clap(author="Sam Cao", version="0.1.0", about="Uptime for Windows")]
struct Args {
    #[arg(short, long, default_value_t = false)]
    pretty: bool,

    #[arg(short, long, default_value_t = false)]
    since: bool,
}

struct Elapsed {
    days: u64,
    hours: u64,
    minutes: u64,
    seconds: u64,
}

impl Elapsed {
    fn pretty_print(&self) {
        let mut items: Vec<String> = vec![];
        if self.days > 0 {
            items.push(if self.days > 1 {
                format!("{} days", self.days)
            } else {
                format!("1 day")
            });
        }
        if self.hours > 0 {
            items.push(if self.hours > 1 {
                format!("{} hours", self.hours)
            } else {
                format!("1 hour")
            });
        }
        if self.minutes > 0 {
            items.push(if self.minutes > 1 {
                format!("{} minutes", self.minutes)
            } else {
                format!("1 minute")
            });
        }
        if self.seconds > 0 {
            items.push(if self.seconds > 1 {
                format!("{} seconds", self.seconds)
            } else {
                format!("1 second")
            });
        }
        println!("up {}", items.join(", "));
    }

    fn print(&self) {
        let mut items: Vec<String> = vec![];
        if self.days > 0 {
            items.push(if self.days > 1 {
                format!("{} days", self.days)
            } else {
                format!("1 day")
            });
        }
        items.push(format!(
            "{:0>2}:{:0>2}:{:0>2}",
            self.hours, self.minutes, self.seconds
        ));
        println!("up {}", items.join(", "));
    }
}

fn build_elapsed(duration: Duration) -> Elapsed {
    let total_seconds = duration.as_secs();
    let days = total_seconds / (60 * 60 * 24);
    let hours = (total_seconds - days * 60 * 60 * 24) / (60 * 60);
    let minutes = (total_seconds - days * 60 * 60 * 24 - hours * 60 * 60) / 60;
    let seconds = total_seconds - days * 60 * 60 * 24 - hours * 60 * 60 - minutes * 60;
    Elapsed {
        days,
        hours,
        minutes,
        seconds,
    }
}

fn main() {
    let args = Args::parse();
    let tick_count_64: u64;
    unsafe {
        tick_count_64 = GetTickCount64();
    }
    let duration = Duration::new(tick_count_64 / 1000, 0);
    if args.pretty {
        let elapsed = build_elapsed(duration);
        elapsed.pretty_print();
    } else if args.since {
        let start_date_time: DateTime<Local> = Local::now().sub(duration);
        println!("{}", start_date_time.format("%Y-%m-%d %H:%M:%S"))
    } else {
        let elapsed = build_elapsed(duration);
        print!("{}", Local::now().format("%H:%M:%S "));
        elapsed.print();
    }
}
